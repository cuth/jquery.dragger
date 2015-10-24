var gulp = require('gulp');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var pjson = require('./package.json');

var BANNER = "\
/*!\n\
 * " + pjson.name + "\n\
 * " + pjson.homepage + "\n\
 * @version " + pjson.version + "\n\
 * @license MIT (c) Jonathan Cuthbert\n\
 */\n\n";
 var JSHINT_EXPORTED = "/*exported Dragger */\n\n";

var AMD_HEAD    = "define(['jquery'], function ($) {\n\n'use strict';\n\n";
var AMD_FOOT    = "\n\nreturn Dragger;\n\n});";

var COMMON_HEAD = "'use strict';\n\nvar $ = require('jquery');\n\n";
var COMMON_FOOT = "\n\nmodule.exports = Dragger;";

var GLOBAL_HEAD = "var Dragger = (function ($) {\n\n'use strict';\n\n";
var GLOBAL_FOOT = "\n\nreturn Dragger;\n\n}(jQuery || Zepto || ender || $));";


gulp.task('build-amd', function () {
    gulp.src('src/jquery.dragger.js')
        .pipe(rename('jquery.dragger.amd.js'))
        .pipe(insert.wrap(BANNER + AMD_HEAD, AMD_FOOT))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-commonjs', function () {
    gulp.src('src/jquery.dragger.js')
        .pipe(rename('jquery.dragger.common.js'))
        .pipe(insert.wrap(BANNER + COMMON_HEAD, COMMON_FOOT))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-global', function () {
    gulp.src('src/jquery.dragger.js')
        .pipe(insert.wrap(BANNER + JSHINT_EXPORTED + GLOBAL_HEAD, GLOBAL_FOOT))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build-amd', 'build-commonjs', 'build-global']);

gulp.task('default', ['build']);
