// eslint-disable-next-line func-names
module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'lib/',
          ext: '.js',
        }],
      },
    },
    clean: ['lib'],
    watch: {
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['babel'],
      },
    },
  });
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
  grunt.registerTask('default', ['clean', 'babel']);
};
