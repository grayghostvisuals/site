// ===================================================
// Settin'
// ===================================================

var gulp            = require('gulp'),
		loadPlugins     = require('gulp-load-plugins'),
		$               = loadPlugins({
												rename: {
													'gulp-gh-pages': 'ghPages',
													'gulp-minify-css': 'mincss',
													'gulp-sass-glob-import': 'sassglob'
												}
											}),
		yaml            = require('js-yaml'),
		helpers         = require('handlebars-helpers'), // github.com/assemble/handlebars-helpers
		expand          = require('expand')(), // pincer.io/node/libraries/expand
		permalinks      = require('assemble-permalinks'),
		assemble        = require('assemble'),
		app             = assemble(),
		del             = require('del'),
		resolve         = require('path').resolve,
		merge           = require('merge-stream'),
		basename        = require('path').basename,
		extname         = require('path').extname;

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
	sass: 'src',
	images: 'img/site',
	images_origin: 'img/site/origin'
};

var path = {
	site: asset_dir.site,
	data: './' + asset_dir.data,
	templates: asset_dir.site + '/' + asset_dir.templates,
	dist: asset_dir.dist,
	js: asset_dir.site + '/' + asset_dir.js,
	css: asset_dir.site + '/' + asset_dir.css,
	sass: asset_dir.site + '/' + asset_dir.css + '/' + asset_dir.sass,
	images: asset_dir.site + '/' + asset_dir.images,
	images_origin: asset_dir.site + '/' + asset_dir.images_origin,
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
			process.env.NODE_ENV === 'development',
			5000,
			5001
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
		.pipe($.stylelint({
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


// Data Loader
// ================

// @info
// Load yaml files using a custom dataLoader.
app.dataLoader('yaml', function(str, fp) {
	return yaml.safeLoad(str);
});

app.helper('isEnv', function(env) {
	return process.env.NODE_ENV === env;
});

function loadData() {
	app.data([glob.data, 'site.yaml', 'package.json'], { namespace: true });
	// app.data('env', process.env.NODE_ENV === 'production' ? 'production' : 'development');
	// app.data('env', process.env.NODE_ENV);
	app.data(expand(app.cache.data));
}

// Setting Methods
// ================

// @info
// create a `categories` object to keep categories in (e.g. 'clients')
// populate categories with pages that specify the categories they belong to.
// When the onLoad middleware runs for a single file, it looks at the file's
// front-matter (file.data) to see if it contains a categories property. This
// property can be a string or an array of strings. If it exists, then the
// middleware updates the categories object for each category in the array. In
// the case of polyon.hbs, there is only 1 category called client, so the categories
// object becomes:
//
// categories: {
//  clients: {
//    "polyon": { ... }
//  }
// };
app.set('categories', {});


// Event Middleware
// ================

// @info
// https://github.com/assemble/assemble/issues/715
// Middleware functions are run at certain points during the build,
// and only on templates that match the middleware's regex pattern.
function fileData(file, next) {
	// if the file doesn't have a data object or
	// doesn't contain `categories` in it's
	// front-matter, move on.
	if (!file.data || !file.data.categories) {
		return next();
	}

	var renameKey = app.renameKey(file.key, file);

	// get the categories object
	var categories = app.get('categories');

	// decipher what categories this file belongs to
	var cats = file.data.categories;

	cats = Array.isArray(cats) ? cats : [cats];

	// add this file's data (file object)
	// to each of it's categories
	cats.forEach(function(cat) {
		categories[cat] = categories[cat] || [];
		categories[cat][renameKey] = file;
	});

	// complete
	next();
}

app.onLoad(/\**\/*.hbs/, fileData);


// Create Events
// ================

// @reference
// plugin for creating permalinks
// https://github.com/assemble/assemble-permalinks
//
// @info
// Create a pages collection
app.create('pages').use(permalinks(':category:name.html', {
	category: function() {
		if (!this.categories) return '';
		var category = Array.isArray(this.categories) ? this.categories[0] : this.categories;
		return category ? category + '/' : '';
	}
}));


// Custom Helpers
// ================

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
		// this renders the block between
		// `{{#category}}` and `{{/category}}`
		// passing the entire page object as the context.
		// return options.fn(pages[page]).toLowerCase();
		return options.fn(pages[page]);
	}).join('\n');
});

app.helper('date', function() {
	var time_stamp = new Date().getFullYear();
	return time_stamp;
});


// App Tasks
// ================

// Placing assemble setups inside the task allows
// live reloading/monitoring for files changes.
gulp.task('assemble', function() {
	app.option('layout', 'default');
	app.helpers(helpers());
	app.layouts(glob.layouts);
	app.partials(glob.includes);
	loadData();

	// @info
	// load pages onto the pages collection
	// https://github.com/assemble/assemble-permalinks/issues/8#issuecomment-231181277
	// ensure the page templates are put on the correct collection
	// and the middleware is triggered.
	app.pages(glob.pages);

	var stream = app.toStream('pages')
		.pipe($.newer(glob.pages))
		.on('error', console.log)
		.pipe(app.renderFile())
		.on('error', console.log)
		.pipe($.extname())
		.on('error', console.log)
		// update the file.path before writing
		// the file to the file system.
		.pipe(app.dest(function(file) {
			// Creates a permalink and puts it on file.data.permalink.
			// This can be used in other templates for linking.
			file.path = resolve(file.base, file.data.permalink);
			return path.site;
		}))
		.on('error', console.log)
		.pipe($.livereload());

	return stream;
});


// ===================================================
// JavaScript Transpilin'
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
// Image Optimizin'
// ===================================================

gulp.task('imgmin', function() {
	return merge(
		gulp.src(path.images_origin + '/*.{jpg,png,jpeg,svg,gif}')
			.pipe($.imagemin({
					interlaced: true,
					progressive: true,
					optimizationLevel: 5,
					svgoPlugins: [{ removeViewBox: false }]
			}))
			.pipe(gulp.dest(path.images)),

		gulp.src(path.images_origin + '/clients/**/*.{jpg,png,jpeg,svg,gif}')
			.pipe($.imagemin({
					interlaced: true,
					progressive: true,
					optimizationLevel: 5,
					svgoPlugins: [{ removeViewBox: false }]
			}))
			.pipe(gulp.dest(path.images + '/' + 'clients'))
	);
});


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
					html: [$.htmlmin({
						empty: true,
						collapseWhitespace: true,
						removeComments: true
					})],
					js: [$.uglify(), $.rev()]
				}))
				.pipe(gulp.dest(path.dist));
		}));
});

gulp.task('mincats', function() {
	return gulp.src(path.site + '/client/*.html')
		.pipe($.foreach(function(stream, file) {
			return stream
				.pipe($.usemin({
					assetsDir: path.site,
					css: [$.rev()],
					html: [$.htmlmin({
						empty: true,
						collapseWhitespace: true,
						removeComments: true
					})],
					js: [$.uglify(), $.rev()]
				}))
				.pipe(gulp.dest(path.dist + '/client'));
		}));
});



// ===================================================
// Duplicatin'
// ===================================================

gulp.task('copy', ['usemin'], function() {
	return merge(
		gulp.src([path.site + '/{img,client,bower_components,js/lib}/**/*'])
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
		path.site + '/{client}',
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
