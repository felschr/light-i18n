module.exports = function (grunt) {
  'use strict'

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: "/*! <%= pkg.name.replace('.js', '') %> <%= grunt.template.today('dd-mm-yyyy') %> */\n"
      },
      dist: {
        files: {
          "dist/<%= pkg.name.replace('.js', '') %>.min.js": ['src/main.js']
        }
      }
    },

    mocha_phantomjs: {
      options: {
        run: true,
      },
      test: {
        src: ['test/{*/,}*.html']
      }
    },

    jshint: {
      files: ['src/{*/,}*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'mocha_phantomjs']
    },

    browserSync: {
      test: {
        src : ['src/*.js', 'test/{*/,}*']
      },
      options: {
        server: {
          baseDir: './'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-mocha-phantomjs')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-browser-sync')

  grunt.registerTask('test', ['jshint', 'mocha_phantomjs'])
  grunt.registerTask('default', ['jshint', 'mocha_phantomjs', 'uglify'])

}
