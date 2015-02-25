/*global exports:true */
module.exports = exports = function(grunt) {
    'use strict';

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        concat: {
            options: {
                separator: '',
            },
            backbone: {
                dest: 'dist/localforage.backbone.js',
                options: {
                    banner:
                        '/*!\n' +
                        '    localForage Backbone Adapter\n' +
                        '    Version ' + pkg.version + '\n' +
                        '    https://github.com/mozilla/localforage-backbone\n' +
                        '    (c) 2014 Mozilla, Apache License 2.0\n' +
                        '*/\n'
                },
                src: [
                    'src/localforage.backbone.js'
                ]
            }
        },
        uglify: {
            backbone: {
                files: {
                    'dist/localforage.backbone.min.js': ['dist/localforage.backbone.js']
                }
            }
        },
        jasmine: {
            backbone: {
                options: {
                    specs: 'test/**/*.js',
                    vendor: [
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/localforage/dist/localforage.js',
                        'dist/localforage.backbone.js'
                    ]
                }
            }
        },
        watch: {
            src: {
                files: 'src/**/*.js',
                tasks: ['test']
            },
            test: {
                files: 'test/**/*.js',
                tasks: ['jasmine']
            }
        }
    });

    require('load-grunt-tasks')(grunt, {pattern: 'grunt-contrib-*'});

    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('build', ['concat', 'uglify']);

    grunt.registerTask('test', ['build', 'jasmine']);
};
