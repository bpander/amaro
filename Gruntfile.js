module.exports = function(grunt) {

    var fs = require('fs');
    var amdclean = require('amdclean');


    // Project configuration.
    grunt.initConfig({

        // pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            dist: {
                options: {
                    findNestedDependencies: true,
                    baseUrl: 'src',
                    optimize: 'none',
                    include: ['Relapse.js'],
                    out: 'Relapse.js',
                    wrap: {
                        start: '',
                        end: ''
                    },
                    onModuleBundleComplete: function (data) {
                        var outputFile = data.path;

                        fs.writeFileSync(outputFile, amdclean.clean({
                            filePath: outputFile,
                            // wrap: {
                            //     start: fs.readFileSync('src/start.js.frag', { encoding: 'utf8' }),
                            //     end: fs.readFileSync('src/end.js.frag', { encoding: 'utf8' })
                            // }
                        }));
                    }
                }
            }
        },


        uglify: {
            dist: {
                files: {
                    'Relapse.min.js': ['Relapse.js']
                }
            }
        }

    });


    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Define tasks
    grunt.registerTask('default', ['requirejs:dist', 'uglify:dist']);

};