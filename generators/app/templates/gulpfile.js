/* jshint node: true */

'use strict';

var gulp = require('gulp');
var ftp = require('vinyl-ftp');
var zip = require('gulp-zip');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var sequence = require('run-sequence');
var del = require('del');
var env = require('node-env-file');
var notifier = require('node-notifier');
var gulpSrc = require('gulp-src-ordered-globs');
var gutil = require('gulp-util');

try {
  env(__dirname + '/.env');
} catch (e) {
  console.error('Could not load .env file');
}

function createConnection() {
  return ftp.create({
    host: process.env.FTPHOST,
    user: process.env.FTPUSER,
    pass: process.env.FTPPASS,
    parallel: 10,
    log: gutil.log
  });
}

var appDeploy = [
  '.htaccess',
  './*.png',
  './*.ico',
  './composer.json',

  './app/**/*',
  '!./app/config/*_local.yml',
  '!./app/database/**/*',
  '!./app/cache/**/*',
  './app/cache/index.html',

  './bolt-public/**/*',
  './files/index.html',
  './files/.htaccess',

  './extensions/composer.json',
  './extensions/installer.php',
  './extensions/local/**/*',

  './index.php'
];

var cleanup = [
  './dist/[tT]ests/**',
  './dist/vendor/psr/log/Psr/Log/Test/**/*',
  './dist/vendor/symfony/form/Symfony/Component/Form/Test/**/*',
  './dist/vendor/twig/twig/lib/Twig/Test/**/*',
  './dist/vendor/twig/twig/test/**/*',
  './dist/vendor/swiftmailer/swiftmailer/test-suite/**/*',
  './dist/composer.*',
  './dist/vendor/symfony/locale/Symfony/Component/Locale/Resources/data/**/*',
  './dist/app/database/.gitignore',
  './dist/app/view/img/debug-nipple-src.png',
  './dist/app/view/img/*.pxm',
  './dist/vendor/swiftmailer/swiftmailer/doc/**/*',
  './dist/vendor/swiftmailer/swiftmailer/notes/**/*'
];

var themeDeploy = [
  './theme/{{ lowerShortName }}/config.yml',
  './theme/{{ lowerShortName }}/rev-manifest.json',
  './theme/{{ lowerShortName }}/assets/.htaccess',
  './theme/{{ lowerShortName }}/assets/**/*',
  './theme/{{ lowerShortName }}/templates/**/*'
];

var themeBase = '{% if webroot != '' %}{{ webroot }}/{% endif %}theme/{{ lowerShortName }}/';

gulp.task('bundle:clean', function(cb) {
  del(['./dist/**/*'], cb);
});

gulp.task('bundle:transfer', function() {
  return gulpSrc(appDeploy, {base: '.'})
    .pipe(gulp.dest('dist'));
});

gulp.task('bundle:theme', function() {
  return gulp.src(themeDeploy, {base: '.'})
    .pipe(gulp.dest('dist'));
});

gulp.task('bundle:update', shell.task(['./composer-update.sh']));

gulp.task('bundle:cleanup', function(cb) {
  del(cleanup, cb);
});

gulp.task('bundle:zip', function() {
  return gulp.src(['./dist/**/*', './dist/**/.htaccess'], {base: './dist'})
    .pipe(zip('{{ lowerShortName }}-bundle.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('bundle', function(cb) {
  sequence('bundle:clean', 'bundle:transfer', 'bundle:theme', 'bundle:update', 'bundle:cleanup', 'bundle:zip', cb);
});

// This will just upload the zip file, so be sure to run
// gulp bundle
// first
gulp.task('deploy:app', function() {
  var conn = createConnection();

  return gulp.src('dist/{{ lowerShortName }}-bundle.zip', {base: './dist'})
    .pipe(conn.dest(process.env.FTPDIR))
    .on('finish', function() {
      notifier.notify({title: '{{ name }} Deploy Complete'});
    });
});



gulp.task('deploy:themedeploy', function() {
  var conn = createConnection();

  return gulp.src(themeDeploy, {base: themeBase})
    .pipe(changed('./theme/{{ lowerShortName }}-deployed', {hasChanged: changed.compareSha1Digest}))
    .pipe(conn.dest(process.env.FTPDIR + '/' + themeBase))
    .on('finish', function() {
      notifier.notify({title: '{{ name }} Theme Deploy Complete'});
    });
});

gulp.task('deploy:themeclean', ['deploy:themedeploy'], function(cb) {
  del(['{{ lowerShortName }}-deployed/**/*'], cb);
});

gulp.task('deploy:theme', ['deploy:themeclean'], function() {
  return gulp.src(themeDeploy, {base: themeBase})
    .pipe(gulp.dest('theme/{{ lowerShortName }}-deployed'));
});


