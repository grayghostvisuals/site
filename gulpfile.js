// ===================================================
// Setup
// ===================================================

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins({
                        rename: {
                          'gulp-minify-css'  : 'mincss',
                          'gulp-minify-html' : 'minhtml',
                          'gulp-gh-pages'    : 'ghPages',
                          'gulp-foreach'     : 'foreach',
                          'gulp-mocha'       : 'mocha'
                        }
                      }),
    assemble        = require('assemble'),
    del             = require('del'),
    merge           = require('merge-stream'),
    basename        = require('path').basename,
    extname         = require('path').extname;

$.exec   = require('child_process').exec;
$.fs     = require('fs');


// ===================================================
// Config
// ===================================================

var env_flag = false;

var asset_dir = {
  site: 'site',
  templates : 'templates',
  data: 'data',
  dist: 'dist',
  js: 'js',
  css: 'css',
  sass: 'src'
};

var path = {
  site: asset_dir.site,
  data: asset_dir.data,
  templates: asset_dir.site + '/' + asset_dir.templates,
  dist: asset_dir.dist,
  js: asset_dir.site + '/' + asset_dir.js,
  css: asset_dir.site + '/' + asset_dir.css,
  sass: asset_dir.site + '/' + asset_dir.css + '/' + asset_dir.sass
};

var glob = {
  html: path.site + '/*.html',
  css: path.css + '/*.css',
  sass: path.sass + '/**/*.scss',
  js: path.js + '/src/**/*.js',
  jslibs : path.js + '/lib/**/*.js',
  layouts: path.templates + '/layouts/*.{md,hbs}',
  pages: path.templates + '/pages/**/*.{md,hbs}',
  includes: path.templates + '/includes/**/*.{md,hbs}',
  data: path.data + '/**/*.{json,yaml}',
  rootData: ['site.yaml', 'package.json']
};


// ===================================================
// Development
// ===================================================

gulp.task('serve', ['assemble'], function() {
  $.connect.server({
    root: [path.site],
    port: 5000,
    livereload: true,
    middleware: function(connect) {
      return [
        connect().use(connect.query())
      ];
    }
  });

  $.exec('open http://localhost:5000');
});


// ===================================================
// Preview
// ===================================================

gulp.task('preview', function() {
  $.connect.server({
    root: [path.dist],
    port: 5001
  });

  $.exec('open http://localhost:5001');
});


// ===================================================
// Unit Testing
// ===================================================

gulp.task('mocha', function () {
  return gulp.src('test/*.js', {read: false})
    .pipe($.mocha({ reporter: 'nyan' }));
});


// ===================================================
// Stylesheets
// ===================================================

gulp.task('sass', function() {
  var stream = gulp.src(glob.sass)
    .pipe($.sass())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(path.css))
    .pipe($.connect.reload());

  return stream;
});


// ===================================================
// Templates
// https://github.com/assemble/assemble/issues/715
// https://github.com/grayghostvisuals/grayghostvisuals/pull/3
// ===================================================

// def: Middleware functions are run at certain points during the build,
// and only on templates that match the middleware's regex pattern.

// 1. In assemble 0.6 it would require setting up a middleware to collect the categories from the pages.
// 2. Then add the category information to each page’s data or use a custom helper to get the category information.
// 3. The documentation isn’t done for this yet, but there’s some on going discussion in a couple of issues (around collections)

// create a `categories` object to keep categories in (e.g. 'clients')
// categories: {
//  clients: {
//    "polyon": { ... }
//  }
// };
assemble.set('categories', {});

/**
 Populate categories with pages that specify the categories they belong to.
 When the onLoad middleware runs for a single file, it looks at the file's front-matter (file.data) to see if it contains a categories property. This property can be a string or an array of strings. If it exists, then the middleware updates the categories object for each category in the array. In the case of polyon.hbs, there is only 1 category called client, so the categories object becomes:

categories: {
 clients: {
   "polyon": { ... }
 }
};
 */

assemble.onLoad(/\.hbs/, function(file, next) {
  // if the file doesn't have a data object or
  // doesn't contain `categories` in it's front-matter, move on
  if (!file.data || !file.data.categories) {
    return next();
  }

  // use the default `renameKey` function to store
  // pages on the `categories` object
  var renameKey = assemble.option('renameKey');

  // get the categories object
  var categories = assemble.get('categories');

  // figure out which categories this file belongs to
  var cats = file.data.categories;
  cats = Array.isArray(cats) ? cats : [cats];

  // add this file's data (file object) to each of it's catogories
  cats.forEach(function (cat) {
    categories[cat] = categories[cat] || [];
    categories[cat][renameKey(file.path)] = file;
  });

  // done
  next();
});


/**
 * Handlebars helper to iterate over an object of pages for a specific category
 *
 * ```
 * {{#category "clients"}}
 *   <li>{{data.summary}}</li>
 * {{/category}}
 * ```
 */

assemble.helper('category', function (category, options) {
  var pages = this.app.get('categories.' + category);
  if (!pages) {
    return '';
  }
  return Object.keys(pages).map(function (page) {
    // this renders the block between `{{#category}}` and `{{category}}` passing the
    // entire page object as the context.
    // If you only want to use the page's front-matter, then change this to something like
    // return options.fn(pages[page].data);
    return options.fn(pages[page]).toLowerCase();
  }).join('\n');
});

/**
 * Load data onto assemble cache.
 * This loads data from `glob.data` and `glob.rootData`.
 * When loading `glob.rootData`, use a custom namespace function
 * to return `pkg` for `package.json`.
 *
 * After all data is loaded, process the data to resolve templates
 * in values.
 * @doowb PR: https://github.com/grayghostvisuals/grayghostvisuals/pull/5
 */

function loadData () {
  assemble.data(glob.data);
  assemble.data(assemble.plasma(glob.rootData, {namespace: function (fp) {
    var name = basename(fp, extname(fp));
    if (name === 'package') return 'pkg';
    return name;
  }}));
  assemble.data(assemble.process(assemble.data()));
}

gulp.task('assemble', function() {

  // Placing assemble setups inside the task allows live reloading for files changes
  assemble.option('production', env_flag);
  assemble.option('layout', 'default');
  assemble.layouts(glob.layouts);
  assemble.partials(glob.includes);
  loadData();

  var stream = assemble.src(glob.pages)
    .pipe($.extname())
    .pipe(assemble.dest(path.site))
    .pipe($.connect.reload());

  return stream;
});


// ===================================================
// SVG
// ===================================================

gulp.task('svgstore', function () {
  return gulp
    .src(path.site + '/img/icons/linear/*.svg')
    .pipe($.svgmin({
      plugins: [{
        removeDoctype: true
      }]
    }))
    .pipe($.svgstore())
    .pipe($.cheerio(function($) {
      $('svg').attr('style', 'display:none');
    }))
    .pipe(gulp.dest(path.templates + '/includes/atoms/svg-sprite.svg'));
});


// ===================================================
// Minification
// ===================================================

gulp.task('cssmin', ['sass'], function() {
  var stream = gulp.src(glob.css)
    .pipe($.mincss({ keepBreaks:true }))
    .pipe(gulp.dest(path.css));

  return stream;
});


// ===================================================
// Build
// ===================================================

gulp.task('usemin', ['assemble', 'cssmin'], function () {
  return gulp.src(glob.html)
    .pipe($.foreach(function (stream, file) {
      return stream
        .pipe($.usemin({
          assetsDir: path.site,
          css: [ $.rev() ],
          html: [ $.minhtml({ empty: true }) ],
          js: [ $.uglify(), $.rev() ]
        }))
        .pipe(gulp.dest(path.dist));
    }));
});


// ===================================================
// Duplicate
// ===================================================

gulp.task('copy', ['usemin'], function() {
  return merge(
    // js
    gulp.src([glob.jslibs])
        .pipe(gulp.dest(path.dist + '/js/lib')),
    gulp.src([glob.js])
        .pipe(gulp.dest(path.dist + '/js/src')),

    // images
    gulp.src([path.site + '/img/**/*'])
        .pipe(gulp.dest(path.dist + '/img')),

    // dirs
    gulp.src([path.site + '/bower_components/**/*'])
        .pipe(gulp.dest(path.dist + '/bower_components')),
    gulp.src([path.site + '/client/**/*'])
        .pipe(gulp.dest(path.dist + '/client')),

    // root files
    gulp.src([
        '*.php',
        path.site + '/googlee3138e5e7e9413ae.html',
        path.site + '/*.ico',
        path.site + '/*.png',
        path.site + '/.htaccess',
        path.site + '/*.txt'
      ]).pipe(gulp.dest(path.dist))
  );
});


// ===================================================
// Release
// ===================================================

gulp.task('stage', function() {
  return gulp.src([path.dist + '/**/*', path.dist + '/.htaccess' ])
    .pipe($.ghPages({ branch: 'staging' }));
});

gulp.task('deploy', function() {
  return gulp.src([path.dist + '/**/*', path.dist + '/.htaccess' ])
    .pipe($.ghPages({ branch: 'master' }));
});


// ===================================================
// Cleaning
// ===================================================

gulp.task('clean', function(cb) {
  del([
    'dist',
    glob.css,
    path.site + '/client',
    glob.html,
    path.site + '/js/build'
  ], cb);
});


// ===================================================
// Monitoring
// ===================================================

gulp.task('watch', function() {
  gulp.watch([
    path.dist + '/**/*.scss',
    glob.sass
  ], ['sass']);

  gulp.watch([
    glob.includes,
    glob.pages,
    glob.layouts
  ], ['assemble']);
});


// ===================================================
// Tasks
// ===================================================

gulp.task('build', [ 'copy','usemin' ]);
gulp.task('default', [ 'sass','assemble','serve','watch' ]);
