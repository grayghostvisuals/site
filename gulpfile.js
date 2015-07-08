// ===================================================
// Setup
// ===================================================

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins({
                        rename: {
                          'gulp-minify-css'  : 'mincss',
                          'gulp-minify-html' : 'minhtml',
                          'gulp-gh-pages'    : 'ghPages'
                        }
                      }),
    assemble        = require('assemble'),
    del             = require('del'),
    merge           = require('merge-stream');

$.exec   = require('child_process').exec;
$.fs     = require('fs');


// ===================================================
// Config
// ===================================================

var paths_dir = {
  site: 'site',
  templates : 'templates',
  data: 'data',
  dist: 'dist',
  sitejs: 'js',
  sitecss: 'css',
  sitesass: 'src'
};

var paths = {
  site: paths_dir.site,
  data: paths_dir.data,
  templates: paths_dir.site + '/' + paths_dir.templates,
  dist: paths_dir.dist,
  sitejs: paths_dir.site + '/' + paths_dir.sitejs,
  sitecss: paths_dir.site + '/' + paths_dir.sitecss,
  sitesass: paths_dir.site + '/' + paths_dir.sitecss + '/' + paths_dir.sitesass
};


// ===================================================
// Server
// ===================================================

gulp.task('serve', ['assemble'], function() {
  $.connect.server({
    root: [paths.site],
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
// Stylesheets
// ===================================================

gulp.task('sass', function() {
  var stream = gulp.src(paths.sitesass + '/**/*.scss')
    .pipe($.sass())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(paths.sitecss))
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

gulp.task('assemble', function() {

  // putting assemble setup inside the task to allow reloading when files change
  assemble.option('layout', 'default');
  assemble.layouts(paths.templates + '/layouts/*.{md,hbs}');
  assemble.partials(paths.templates + '/includes/**/*.{md,hbs}');
  assemble.data(paths.data + '/**/*.{json,yaml}');

  var stream = assemble.src(paths.templates + '/pages/**/*.{md,hbs}')
    .pipe($.extname())
    .pipe(assemble.dest(paths.site))
    .pipe($.connect.reload());

  return stream;
});


// ===================================================
// SVG
// ===================================================

gulp.task('svgstore', function () {
  return gulp
    .src(paths.site + '/img/icons/linear/*.svg')
    .pipe($.svgmin({
      plugins: [{
        removeDoctype: true
      }]
    }))
    .pipe($.svgstore())
    .pipe($.cheerio(function($) {
        $('svg').attr('style', 'display:none');
    }))
    .pipe(gulp.dest(paths.templates + '/includes/atoms/svg-sprite.svg'));
});


// ===================================================
// Build
// ===================================================

gulp.task('copy', ['assemble'], function() {
  return merge(
    // jslibs
    gulp.src([paths.sitejs + '/lib/**/*.js'])
        .pipe(gulp.dest(paths.dist + '/js/lib')),

    // images
    gulp.src([paths.site + '/img/**/*'])
        .pipe(gulp.dest(paths.dist + '/img')),

    // dirs
    gulp.src([paths.site + '/bower_components/**/*'])
        .pipe(gulp.dest(paths.dist + '/bower_components')),
    gulp.src([paths.site + '/client/**/*'])
        .pipe(gulp.dest(paths.dist + '/client')),

    // root files
    gulp.src([
        '*.php',
        paths.site + '/googlee3138e5e7e9413ae.html',
        paths.site + '/*.ico',
        paths.site + '/.htaccess',
        paths.site + '/*.txt'
      ]).pipe(gulp.dest(paths.dist))
  );
});

gulp.task('cssmin', ['sass'], function() {
  var stream = gulp.src(paths.sitecss + '/*.css')
    .pipe($.mincss({ keepBreaks:true }))
    .pipe(gulp.dest(paths.sitecss));

  return stream;
});


gulp.task('usemin', ['assemble', 'cssmin'], function() {
  var stream = gulp.src([
        paths.site + '/*.html'
      ])
      .pipe($.usemin({
        css: [ $.rev() ],
        html: [ $.minhtml({ empty: true }) ],
        js: [ $.uglify(), $.rev() ]
      }))
      .pipe(gulp.dest(paths.dist));

  return stream;
});


// ===================================================
// Release
// ===================================================

gulp.task('stage', function() {
  return gulp.src([paths.dist + '/**/*', paths.dist + '/.htaccess' ])
    .pipe($.ghPages({ branch: 'staging' }));
});

gulp.task('deploy', function() {
  return gulp.src([paths.dist + '/**/*', paths.dist + '/.htaccess' ])
    .pipe($.ghPages({ branch: 'master' }));
});


// ===================================================
// Cleaning
// ===================================================

gulp.task('clean', function(cb) {
  del([
    'dist',
    paths.site + '/css/*.css',
    paths.site + '/client',
    paths.site + '/*.html',
    paths.site + '/js/build'
  ], cb);
});


// ===================================================
// Monitoring
// ===================================================

gulp.task('watch', function() {
  gulp.watch([
    paths.dist + '/**/*.scss',
    paths.sitesass + '/**/*.scss'
  ], ['sass']);

  gulp.watch([
    paths.templates + '/includes/**/*.hbs',
    paths.templates + '/pages/*.hbs',
    paths.templates + '/layouts/*.hbs'
  ], ['assemble']);

  gulp.watch([
    paths.site + '/includes/*.html'
  ], [$.connect.reload()]);
});


// ===================================================
// Tasks
// ===================================================

gulp.task('build', ['copy', 'usemin']);
gulp.task('default', ['sass', 'assemble', 'serve', 'watch']);
