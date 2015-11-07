var gulp = require('gulp'),
		sulfur = require('../'),
		os = require('os'),
		del = require('del'),
		babel = require('gulp-babel'),
		filter = require('gulp-filter'),
		sass = require('gulp-sass'),
		path = require('path');

gulp.task('clean', function (cb) {
	var paths = [
		path.join(os.tmpdir(), '*.html'),
		path.join(os.tmpdir(), '*.js'),
		path.join(os.tmpdir(), '*.css'),
		path.join(os.tmpdir(), 'sub')
	];
	var opts = { force: true };
	return del(paths, opts);
});

gulp.task('default', function () {
	var scssFilter = filter(['*.css', '**/*.css'], { restore: true });
	
	return gulp.src('**/*.component.html')
		.pipe(sulfur.heat())
		.pipe(babel({
			presets: ['es2015'],
			only: '*.js'
		}))
		.pipe(scssFilter)
		.pipe(sass().on('error', sass.logError))
		.pipe(scssFilter.restore)
		.pipe(sulfur.anneal())
		.pipe(gulp.dest(os.tmpdir()));
});
