module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    uglify: {
      options: {
        banner: "/*! <%= pkg.name.replace('.js', '') %> <%= grunt.template.today('dd-mm-yyyy') %> */\n"
      },
      dist: {
        files: {
          "dist/<%= pkg.name.replace('.js', '') %>.min.js": ["src/main.js"]
        }
      }
    },

    qunit: {
      files: ["test/*.html"]
    },

    jshint: {
      files: ["src/{*/,}*.js"],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },
        jshintrc: ".jshintrc"
      }
    },

    watch: {
      files: ["<%= jshint.files %>"],
      tasks: ["jshint", "qunit"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("test", ["jshint", "qunit"]);
  grunt.registerTask("default", ["jshint", "qunit", "uglify"]);

};
