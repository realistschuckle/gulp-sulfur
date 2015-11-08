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

# Prevent a tag from processing

	<dom-module is="x-tag">
		<template>
			<style>
				.this-will-get-processed {}
			</style>
			<style data-no-process>
				.no-processing {}
			</style>
		</template>
		<script>
			console.log("Processed");
		</script>
		<script data-no-process>
			console.log("Not processed");
		</script>
	</dom-module>
