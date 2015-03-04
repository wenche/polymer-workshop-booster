var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var httpProxy = require('http-proxy');
var proxyTarget = "http://booster-polymer.azurewebsites.net/";

var proxy = httpProxy.createProxyServer({
    target: proxyTarget,
    headers: {
        host: 'booster-polymer.azurewebsites.net'
    }
}).listen(8011);

var proxyMiddleware = function(req, res, next) {
    if (req.url.indexOf('/api') != -1) {
        proxy.web(req, res);
    } else {
        next();
    }
};


// watch files for changes and reload
gulp.task('default', function() {
    browserSync({
        server: {
            baseDir: 'app/',
            middleware: proxyMiddleware
        },
        startPath: "starter/index.html"
    });

    gulp.watch(['*.html'], {cwd: 'app/'}, reload);
});
