/* jshint node: true */

'use strict';

var gulp = require('gulp');
var ftp = require('vinyl-ftp');
var zip = require('gulp-zip');
var changed = require('gulp-changed');
var sequence = require('run-sequence');
var del = require('del');
var env = require('node-env-file');
var notifier = require('node-notifier');
var gulpSrc = require('gulp-src-ordered-globs');
var gutil = require('gulp-util');
var path = require('path');
var argv = require('yargs').argv;
var exec = require('child_process').execSync;

var composer = require('./composer.json');
var webDir = path.join('./', composer.extra['bolt-web-dir'] || './');

try {
  env(__dirname + '/.env');
} catch (e) {
  console.error('Could not load .env file');
}

function webPath(dir) {
  return path.join(webDir, dir);
}

require('./theme/gulp');

function createConnection() {
  if (!process.env.FTPHOST) {
    console.log('You have not entered your FTP credentials. Please do so in the .env file');
    process.exit();
  }

  return ftp.create({
    host: process.env.FTPHOST,
    user: process.env.FTPUSER,
    pass: process.env.FTPPASS,
    parallel: 10,
    log: gutil.log
  });
}

var appDeploy = [
  webPath('.htaccess'),
  webPath('./*.png'),
  webPath('./*.ico'),
  './composer.*',

  './app/**/*',
  '!./app/config/*_local.yml',
  '!./app/database/**/*',
  '!./app/cache/**/*',
  './app/cache/index.html',

  webPath('./bolt-public/**/*'),
  webPath('./files/index.html'),
  webPath('./files/.htaccess'),

  './extensions/composer.*',
  './extensions/ExtensionInstaller.php',
  './extensions/local/**/*',
  './src/**/*.php',

  webPath('./index.php')
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
  'theme/config.yml',
  'theme/rev-manifest.json',
  'theme/templates/**/*',

  webPath('theme-assets/.htaccess'),
  webPath('theme-assets/**/*')
];

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

gulp.task('bundle:update', function () {
  var cmdString = 'composer update --no-dev --optimize-autoloader --prefer-dist';
  exec(cmdString, { cwd: './dist', stdio: 'inherit' });
  exec('composer bolt-update', { cwd: './dist', stdio: 'inherit' });
  exec(cmdString, { cwd: './dist/extensions', stdio: 'inherit' });
});

gulp.task('bundle:cleanup', function(cb) {
  del(cleanup, cb);
});

gulp.task('bundle:zip', function() {
  return gulp.src(['./dist/**/*', './dist/**/.htaccess'], {base: './dist'})
    .pipe(zip('site-bundle.zip'))
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

  return gulp.src('dist/site-bundle.zip', {base: './dist'})
    .pipe(conn.dest(process.env.FTPDIR))
    .on('finish', function() {
      notifier.notify({title: '{{ name }} Deploy Complete'});
    });
});

gulp.task('deploy:file', function () {
  var conn = createConnection();
  var file = argv.file;

  if (file == null) {
    throw new Error('Must supply --file argument');
  }

  return gulp.src(file.split(','), { base: '.' })
    .pipe(conn.dest(process.env.FTPDIR));
});

gulp.task('deploy:themedeploy', function() {
  var conn = createConnection();

  return gulp.src(themeDeploy, {base: '.'})
    .pipe(changed('./_theme-deployed', {hasChanged: changed.compareSha1Digest}))
    .pipe(conn.dest(process.env.FTPDIR))
    .on('finish', function() {
      notifier.notify({title: '{{ name }} Theme Deploy Complete'});
    });
});

gulp.task('deploy:themeclean', ['deploy:themedeploy'], function(cb) {
  del(['_theme-deployed/**/*'], cb);
});

gulp.task('deploy:theme', ['deploy:themeclean'], function() {
  return gulp.src(themeDeploy, {base: '.'})
    .pipe(gulp.dest('./_theme-deployed'));
});
