# gulp-sulfur
A gulp plugin that assists in building Polymer-based Web Components.

# Usage

		gulp.task('default', function () {
			var scssFilter = filter(['*.css', '**/*.css'], { restore: true });

			return gulp.src('./src/**/*.component.html')
				.pipe(sulfur.heat())
				.pipe(babel({
					presets: ['es2015'],
					only: '*.js'
				}))
				.pipe(scssFilter)
				.pipe(sass().on('error', sass.logError))
				.pipe(scssFilter.restore)
				.pipe(sulfur.anneal())
				.pipe(gulp.dest('./build'));
		});
