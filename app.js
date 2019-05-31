( function() {
	'use strict';

	/**
	 * Build the rsync command based on passed params
	 * 
	 * @param	{Object}	params
	 * @return	{String}
	 */
	function builder( params = {} ) {

		/**
		 * Deep merge user input with defaults
		 * 
		 * @type {Object}
		 */
		params = $.extend( true, {
			src: {
				login: '',
				host: '',
				path: ''
			},
			dest: {
				login: '',
				host: '',
				path: ''
			},
			ignore: {
				files: [],
				exclude: []
			},
			setting: {
				port: '',
				contents: '',
				compress: '',
				archive: '',
				extraneous: '',
				recursive: '',
				dirs: ''
			}
		}, params );

		/**
		 * Final command parts
		 * 
		 * @type {Array}
		 */
		const parts = [];

		/**
		 * Setting switches
		 * 
		 * @type {Array}
		 */
		const switches = [];

		/**
		 * Rsync compresses the file data as it is sent to the destination machine
		 */
		if ( params.setting.compress ) {
			switches.push( 'z' ); // --compress
		}

		/**
		 * Archive mode; equals -rlptgoD (no -H,-A,-X)
		 */
		if ( params.setting.archive ) {
			switches.push( 'a' ); // --archive
		}

		/**
		 * Recurse into directories
		 */
		if ( params.setting.recursive ) {
			switches.push( 'r' ); // --recursive
		}

		/**
		 * Transfer directories without recursing
		 */
		if ( params.setting.dirs ) {
			switches.push( 'd' ); // --dirs
		}

		/**
		 * Merge all of the shorthand switches into one flag
		 */
		if ( switches.filter( Boolean ).length ) {
			parts.push( '-' + switches.join( '' ) );
		}

		/**
		 * Add a port number to the connection
		 */
		if ( params.setting.port ) {
			parts.push( `-e "ssh -p ${params.setting.port}"` );
		}

		/**
		 * Delete extraneous files from dest dirs
		 */
		if ( params.setting.extraneous ) {
			parts.push( '--delete' );
		}

		/**
		 * Exclude files matching the pattern
		 */
		if ( params.ignore.exclude ) {
			if ( typeof params.ignore.exclude === 'string' ) {
				params.ignore.exclude = params.ignore.exclude.split( /[\r\n]+/ ).filter( Boolean );
			}

			if ( Array.isArray( params.ignore.exclude ) ) {
				for ( let i = 0; i < params.ignore.exclude.length; i++ ) {
					parts.push( `--exclude "${params.ignore.exclude[ i ]}"` );
				}
			}
		}

		/**
		 * DON'T exclude files matching the pattern
		 */
		if ( params.ignore.include ) {
			if ( typeof params.ignore.include === 'string' ) {
				params.ignore.include = params.ignore.include.split( /[\r\n]+/ ).filter( Boolean );
			}

			if ( Array.isArray( params.ignore.include ) ) {
				for ( let i = 0; i < params.ignore.include.length; i++ ) {
					parts.push( `--include "${params.ignore.include[ i ]}"` );
				}
			}
		}

		/**
		 * Add the source connection and path
		 */
		if ( params.src.login && params.src.host && params.src.path ) {
			parts.push( `${params.src.login}@${params.src.host}:"${params.src.path}"` );
		} else if ( params.src.path ) {
			parts.push( `"${params.src.path}"` );
		}

		/**
		 * Add the destination connection and path
		 */
		if ( params.dest.login && params.dest.host && params.dest.path ) {
			parts.push( `${params.dest.login}@${params.dest.host}:"${params.dest.path}"` );
		} else if ( params.dest.path ) {
			parts.push( `"${params.dest.path}"` );
		}

		/**
		 * Build and return the command
		 */
		return 'rsync ' + parts.filter( Boolean ).join( ' ' );
	}


	const $srcPath	= $( '[name="src[path]"]' );
	const $contents	= $( '[name="setting[contents]"]' );

	/**
	 * Check/uncheck contents checkbox on source path change
	 */
	$srcPath.on( 'change input keyup keydown', function() {
		const path = /\/$/i.test( $( this ).val() );
		$contents.prop( 'checked', path );
	} );

	/**
	 * Add/remove trailing slash to source path on check/uncheck
	 */
	$contents.on( 'change input keyup', function() {
		let path = $srcPath.val().replace( /\/$/i, '' );

		if ( $contents.is( ':checked' ) ) {
			path = `${path}/`;
		}

		$srcPath.val( path );
	} );

	/**
	 * Build query on all input change
	 */
	$( ':input' ).not( '[readonly]' ).on( 'change input keyup mouseup', function() {
		const values = $( ':input' ).serializeArray();

		let query = {};

		for ( let i = 0; i < values.length; i++ ) {
			const field = values[ i ];
			const matches = field.name.match( /([a-z]{1,})\[([a-z]{1,})\]/i );

			const group = matches[ 1 ];
			const key = matches[ 2 ];
			
			if ( group && key ) {
				if ( typeof query[ group ] === 'undefined' ) {
					query[ group ] = {};
				}

				query[ group ][ key ] = field.value;

			}
		}

		$( 'textarea[readonly]' ).val( builder( query ) );
	} ).trigger( 'change' );

} )( jQuery );