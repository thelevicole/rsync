'use strict';

const gulp		= require( 'gulp' );
const rename	= require( 'gulp-rename' );
const babel		= require( 'gulp-babel' );
const minify	= require( 'gulp-babel-minify' );
const browsers	= [ 'last 2 version', '> 1%', 'ie 8', 'ie 7' ];

gulp.task( 'javascript', function() {
	return gulp.src( [ './app.js' ] )
		.pipe( babel( {
			'presets': [
				[ '@babel/env', {
						'targets': { 'browsers': browsers }
				} ]
			]
		} ) )
		.on( 'error', console.error.bind( console ) )
		.pipe( minify() )
		.pipe( rename( 'app.min.js' ) )
		.pipe( gulp.dest( './' ) );
} );

gulp.task( 'watch', function() {
	gulp.watch( [ './app.js' ], gulp.parallel( 'javascript' ) );
} );

gulp.task( 'default', gulp.parallel( 'javascript' ) );