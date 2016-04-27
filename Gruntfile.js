module.exports = function(grunt) {

    var fs = require('fs');
    var amdclean = require('amdclean');


    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            dist: {
                options: {
                    findNestedDependencies: true,
                    baseUrl: 'src',
                    optimize: 'none',
                    include: ['Amaro.js'],
                    out: 'Amaro.js',
                    wrap: {
                        start: '',
                        end: ''
                    },
                    onModuleBundleComplete: function (data) {
                        var outputFile = data.path;

                        fs.writeFileSync(outputFile, amdclean.clean({
                            filePath: outputFile,
                            transformAMDChecks: false,
                            wrap: {
                                start: fs.readFileSync('src/start.frag.js', { encoding: 'utf8' }),
                                end: fs.readFileSync('src/end.frag.js', { encoding: 'utf8' })
                            }
                        }));
                    }
                }
            }
        },


        uglify: {
            dist: {
                files: {
                    'Amaro.min.js': ['Amaro.js']
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