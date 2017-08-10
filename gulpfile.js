const gulp = require("gulp");
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
gulp.task("node", function() {
    nodemon({
        script: './index.js',
        //服务器文件
        ext: 'js ejs',
    });
});
gulp.task('server', ["node"], function() {
    let files = [
        "./*.ejs",
        "./**/*.ejs",
        'public/**/*.*',
    ];

    browserSync.init(files, {
        proxy: 'http://localhost:8080',
        browser: 'firefox',
        notify: false,
        port: 3030
    });
    gulp.watch(files).on("change", reload);
});