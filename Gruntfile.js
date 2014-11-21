'use strict';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-express-server');
  // grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    express: {
      options: {
        background: true,
        // Override defaults here
      },
      dev: {
        options: {
          script: 'server/server.js'
        }
      },
    },
    sass: {
      css: {
        files: {
          'public/css/track.css': [
            'public/css/track.scss'
          ]
        }
      }
    },
    concat: {
      css: {
        files: {
          'public/dist/app.css': [
            'public/css/*.css'
          ]
        }
      },
      js: {
        files: {
          'public/dist/app.js': [
            // deps
            'public/bower_components/jquery/dist/jquery.min.js',
            'public/bower_components/angular/angular.min.js',
            'public/bower_components/spotify-web-api-js/src/spotify-web-api.js',
            // app
            'public/src/**/*.js'
          ]
        }
      }
    },
    cssmin: {
      css: {
        files: {
          'public/dist/app.min.css': [
            'public/dist/app.css'
          ]
        }
      }
    },
    uglify: {
      js: {
        files: {
          'public/dist/app.min.js': [
            'public/dist/app.js',
          ]
        }
      }
    },
    mochaTest: {
      server: {
        options: {
          reporter: 'Spec'
        },
        src: [ 'tests/*js' ],
      }
    },
    watch: {
      servertests: {
        files: ['server/**'],
        tasks: ['mochaTest:server']
      },
      css: {
        files: ['public/css/**'],
        tasks: ['sass:css', 'concat:css', 'cssmin:css'],
      },
      js: {
        files: ['public/src/**'],
        tasks: ['concat:js', 'uglify:js'],
      },
      express: {
        files:  [ 'server/**' ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions. Without this option specified express won't be reloaded
        }
      }
    }
  });

  grunt.registerTask('default', ['sass:css', 'concat', 'uglify']);
  grunt.registerTask('server', ['express:dev', 'sass:css', 'concat', 'uglify', 'mochaTest', 'watch' ])

};