// ===================================================
// Settin'
// ===================================================

var gulp            = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    $               = gulpLoadPlugins({
                        rename: {
                          'gulp-if': 'if',
                          'gulp-newer': 'newer',
                          'gulp-gh-pages': 'ghPages',
                          'gulp-foreach': 'foreach',
                          'gulp-livereload': 'livereload',
                          'gulp-minify-css': 'mincss',
                          'gulp-minify-html': 'minhtml',
                          'gulp-mocha': 'mocha',
                          'gulp-sass-glob-import': 'sassglob',
                          'gulp-sourcemaps': 'sourcemaps',
                          'gulp-babel': 'babel'
                        }
                      }),
    yaml            = require('js-yaml'),
    helpers         = require('handlebars-helpers'), // github.com/assemble/handlebars-helpers
    expand          = require('expand')(), // pincer.io/node/libraries/expand
    permalinks      = require('assemble-permalinks'),
    assemble        = require('assemble'),
    app             = assemble(),
    del             = require('del'),
    merge           = require('merge-stream'),
    basename        = require('path').basename,
    extname         = require('path').extname,
    gulpStylelint   = require('gulp-stylelint');

$.exec   = require('child_process').exec;
$.fs     = require('fs');


// ===================================================
// Configin'
// ===================================================

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
  data: './' + asset_dir.data,
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
  jsdev: path.js + '/dev/**/*.js',
  jslibs : path.js + '/lib/**/*.js',
  layouts: path.templates + '/layouts/*.{md,hbs}',
  pages: path.templates + '/pages/**/*.{md,hbs}',
  includes: path.templates + '/includes/**/*.{md,hbs}',
  data: path.data + '/**/*.{json,yaml}'
};


// ===================================================
// Servin'
// ===================================================

gulp.task('serve', ['assemble'], function() {
  $.connect.server({
    root: $.if(
      process.env.NODE_ENV === 'production',
      path.dist,
      path.site
    ),
    port: $.if(
      process.env.NODE_ENV === 'production',
      5001,
      5000
    ),
    livereload: $.if(
      process.env.NODE_ENV === 'development',
      true,
      false
    ),
    middleware: function(connect) {
      return [
        connect().use(connect.query())
      ];
    }
  });

  $.exec($.if(
    process.env.NODE_ENV === 'development',
    'open http://localhost:5000',
    'open http://localhost:5001'
  ));
});


// ===================================================
// Testin'
// ===================================================

gulp.task('mocha', function () {
  return gulp.src('test/*.js', { read: false })
    .pipe($.mocha({ reporter: 'nyan' }));
});


// ===================================================
// Lintin'
// ===================================================

// @docs
// https://github.com/kristerkari/stylelint-scss
// https://github.com/stylelint/stylelint/blob/master/docs/user-guide/about-rules.md
gulp.task('lintsass', function() {
  var stream = gulp.src(glob.sass)
    .pipe(gulpStylelint({
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    }));

  return stream;
});


// ===================================================
// Stylin'
// ===================================================

gulp.task('sass', function() {
  var stream = gulp.src(glob.sass)
    .pipe($.newer(glob.sass))
    .pipe($.if(
      process.env.NODE_ENV === 'development',
      $.sourcemaps.init()
    ))
    .pipe($.sassglob())
    .pipe($.sass({
      outputStyle: $.if(process.env.NODE_ENV === 'development', 'expanded', 'compressed')
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe($.if(process.env.NODE_ENV === 'development', $.sourcemaps.write()))
    .pipe(gulp.dest(path.css))
    .pipe($.livereload());

  return stream;
});


// ===================================================
// Templatin'
// ===================================================

// @reference
// https://github.com/node-base/base-data#dataloader
//
// @info
// Loading yaml files is not built in. Assemble uses
// base-data now. You can add yaml loading by using
// a custom dataLoader.
app.dataLoader('yaml', function(str, fp) {
  return yaml.safeLoad(str);
});

app.data($.if(process.env.NODE_ENV === 'production', 'production', 'development'));

// @reference
// https://github.com/assemble/assemble-permalinks
//
// @info
// plugin for easily creating permalinks
// app.create('pages');
// app.use(permalinks(':name.html'));
// app.pages(glob.pages);

// @info
// create a `categories` object to keep categories in (e.g. 'clients')
// categories: {
//  clients: {
//    "polyon": { ... }
//  }
// };
app.set('categories', {});

/**
 populate categories with pages that specify the categories they belong to.
 When the onLoad middleware runs for a single file, it looks at the file's front-matter (file.data) to see if it contains a categories property. This property can be a string or an array of strings. If it exists, then the middleware updates the categories object for each category in the array. In the case of polyon.hbs, there is only 1 category called client, so the categories object becomes:

categories: {
 clients: {
   "polyon": { ... }
 }
};
 */

// @info
// https://github.com/assemble/assemble/issues/715
// Middleware functions are run at certain points during the build,
// and only on templates that match the middleware's regex pattern.
app.onLoad(/\**\/*.hbs/, function(file, next) {
  // if the file doesn't have a data object or
  // doesn't contain `categories` in it's
  // front-matter, move on.
  if (!file.data || !file.data.categories) {
    return next();
  }

  // use the default `renameKey` function to store
  // pages on the `categories` object
  var renameKey = app.option('renameKey');

  // get the categories object
  var categories = app.get('categories');

  // figure out which categories this file belongs to
  var cats = file.data.categories;
  cats = Array.isArray(cats) ? cats : [cats];

  // add this file's data (file object) to each of
  // it's categories
  cats.forEach(function(cat) {
    categories[cat] = categories[cat] || [];
    categories[cat][renameKey(file.path)] = file;
  });

  // done
  next();
});


// @info
// Handlebars helper that iterates over an
// object of pages for a specific category
//
// @example
// {{#category "clients"}}
//   {{data.summary}}
// {{/category}}
app.helper('category', function(category, options) {
  var pages = this.app.get('categories.' + category);
  if (!pages) {
    return '';
  }

  return Object.keys(pages).map(function(page) {
    // this renders the block between `{{#category}}` and `{{/category}}` passing the
    // entire page object as the context.
    return options.fn(pages[page]).toLowerCase();
  }).join('\n');
});

app.helper('date', function() {
  var time_stamp = new Date().getFullYear();
  return time_stamp;
});

function loadData() {
  app.data([glob.data, 'site.yaml', 'package.json'], { namespace: true });
  app.data(expand(app.cache.data)); // https://github.com/assemble/issues/875
  //console.log(app.cache.data);
}

// Placing assemble setups inside the task allows
// live reloading/monitoring for files changes.
gulp.task('assemble', function() {
  app.option('layout', 'default');
  app.helpers(helpers());
  app.layouts(glob.layouts);
  app.partials(glob.includes);
  loadData();

  var stream = app.src(glob.pages)
    .pipe($.newer(glob.pages))
    .on('error', console.log)
    .pipe(app.renderFile())
    .on('error', console.log)
    .pipe($.extname())
    .pipe(app.dest(path.site))
    .pipe($.livereload());

  return stream;
});


// ===================================================
// Transpilin'
// ===================================================

gulp.task('babel', function() {
  var stream = app.src(glob.jsdev)
    .pipe($.newer(glob.js))
    .pipe($.babel({
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }))
    .pipe(gulp.dest(path.js + '/src'))
    .pipe($.livereload());

  return stream;
});


// ===================================================
// Optimizin'
// ===================================================

gulp.task('svgstore', function() {

  var stream = gulp.src(path.images + '/svgsprite/*.svg')
    .pipe($.svgmin({
      plugins: [{
        removeDoctype: true
      },
      {
        removeComments: true
      }]
    }))
    .pipe($.svgstore({
      inlineSvg: true
    }))
    .pipe($.cheerio({
      run: function($) {
        $('svg').attr('style', 'display:none');
      },
      parserOptions: {
        //https://github.com/cheeriojs/cheerio#loading
        //https://github.com/fb55/htmlparser2/wiki/Parser-options#option-xmlmode
        xmlMode: true
      }
    }))
    .pipe(gulp.dest(path.templates + '/includes/atoms/svg-sprite.svg'));

    return stream;

});


// ===================================================
// Buildin'
// ===================================================

// @info
// foreach is because usemin 0.3.11 won't
// manipulate multiple files as an array.
gulp.task('usemin', ['babel', 'assemble', 'sass'], function() {

  return gulp.src(glob.html)
    .pipe($.foreach(function(stream, file) {
      return stream
        .pipe($.usemin({
          assetsDir: path.site,
          css: [$.rev()],
          html: [$.minhtml({
            empty: true,
            collapseWhitespace: true,
            removeComments: true
          })],
          js: [$.uglify(), $.rev()]
        }))
        .pipe(gulp.dest(path.dist));
    }));

});


// ===================================================
// Duplicatin'
// ===================================================

gulp.task('copy', ['usemin'], function() {

  return merge(
    gulp.src([path.site + '/{img,bower_components,js/lib}/**/*'])
        .pipe(gulp.dest(path.dist)),

    gulp.src([
        'webhook.php',
        path.site + '/*.{ico,png,txt}',
        path.site + '/.htaccess',
      ]).pipe(gulp.dest(path.dist))
  );

});


// ===================================================
// Releasin'
// ===================================================

gulp.task('deploy', function() {

  return gulp.src([path.dist + '/**/*', path.dist + '/.htaccess' ])
              .pipe($.ghPages(
                $.if(process.env.NODE_ENV === 'development',
                  { branch: 'staging' },
                  { branch: 'master' })
                )
              );

});


// ===================================================
// Cleanin'
// ===================================================

gulp.task('clean', function(cb) {

  del([
    'dist',
    glob.css,
    path.site + '/client',
    glob.html
  ], cb);

});


// ===================================================
// Monitorin'
// ===================================================

gulp.task('watch', function() {

  gulp.watch([
    glob.sass
  ], ['sass']);

  gulp.watch([
    glob.layouts,
    glob.includes,
    glob.pages
  ], ['assemble']);

  gulp.watch([
    path.js + '/dev/*.js'
  ], ['babel']);

  $.livereload.listen();

});


// ===================================================
// Taskin'
// ===================================================

gulp.task('build', [ 'copy', 'usemin' ]);
gulp.task('default', [ 'sass', 'serve', 'watch' ]);
