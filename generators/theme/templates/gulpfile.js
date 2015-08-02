'use strict';

/**
 * Handle all of the theme building tasks
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var argv = require('yargs').argv;
var sequence = require('run-sequence');
var path = require('path');
var del = require('del');
var env = require('node-env-file');
{% if theme.js == 'browserify' -%}
var browserify = require('browserify');
var reload = browserSync.reload;
var bulkify = require('bulkify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
{% if theme.bower %}var debowerify = require('debowerify');{% endif %}
{% endif %}
var keypress = require('keypress');

var isDist = argv.dist;
var isServing = false;

try {
  env(path.join(__dirname, '.env'));
} catch (e) {
  console.error('Could not load .env file');
}

var onError = function onError(err) {
  $.util.beep();
  console.log(err.message);
  this.emit('end');
};


// Compile styles into a single css file
gulp.task('clean:css', function(cb) {
  del(['assets/styles/**/*.*', '_tmp/styles/**/*.*'], cb);
});

gulp.task('css', ['clean:css'], function() {
  {% if theme.css == 'less' -%}
  return gulp.src(['src/less/main.less'], {base: path.join(__dirname, 'src/less')})
  {%- elif theme.css == 'css' -%}
  return gulp.src(['src/css/main.css'], { base: path.join(__dirname, 'src/css') })
  {%- elif theme.css == 'sass' -%}
  return gulp.src('nope')
  {%- endif %}
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.if(!isDist, $.sourcemaps.init()))
  {%- if theme.css == 'less' %}
    .pipe($.less({
      paths: [{% if theme.bower %}path.join(__dirname, 'src', 'bower'){% if theme.npm %}, {% endif %}{% endif %}{% if theme.npm %}path.join(__dirname, 'node_modules'){% endif %}]
    }))
  {%- elif theme.css == 'css' %}
    .pipe($.cssnext({
      import: {
        path: [{% if theme.bower %}path.join(__dirname, 'src', 'bower'){% if theme.npm %}, {% endif %}{% endif %}{% if theme.npm %}path.join(__dirname, 'node_modules'){% endif %}]
      }
    }))
  {%- endif %}
    .pipe($.autoprefixer({cascade: false}))
    .pipe($.if(isDist, $.minifyCss()))
    .pipe(gulp.dest('_tmp/styles'));
});


// Compile scripts into a single js file
gulp.task('clean:js', function(cb) {
  del(['assets/scripts/**/*.*', '_tmp/scripts/**/*.*', '!_tmp/scripts/modernizr.js'], cb);
});

{% if theme.js == 'js' -%}
var jsIncludes = [
  'src/bower/jquery/dist/jquery.js',
  'src/js/modules/**/*.js',
  'src/js/contexts/**/*.js',
  'src/js/{{ shortName.toLowerCase() }}.js'
];
{% endif -%}

{%- if theme.js == 'browserify' %}
function gulpBrowserify(fileIn, fileOut) {
  return browserify({
      entries: fileIn,
      debug: !isDist
    })
    .transform(bulkify)
    {% if theme.bower -%}
    .transform(debowerify)
    {% endif -%}
    .bundle()
    .on('error', onError)
    .pipe(source(fileOut))
    .pipe(buffer())
}
{% endif -%}

gulp.task('js', ['clean:js'], function() {
  {% if theme.js == 'js' -%}
  return gulp.src(jsIncludes)
    .pipe($.if(!isDist, $.sourcemaps.init()))
    .pipe($.concat('main.js'))
  {%- elif theme.js == 'browserify' -%}
  return gulpBrowserify('./src/js/main.js', 'main.js')
    .pipe($.if(!isDist, $.sourcemaps.init({ loadMaps: true})))
  {%- endif -%}
    .pipe($.if(isDist, $.uglify()))
    .pipe($.if(!isDist, $.sourcemaps.write()))
    .pipe(gulp.dest('_tmp/scripts'));
});

// Modernizr build
gulp.task('clean:modernizr', function (cb) {
  del(['_tmp/scripts/modernizr.js'], cb)
});

gulp.task('modernizr', ['clean:modernizr'], function () {
  return gulp.src(['_tmp/scripts/*.js', '_tmp/styles/*.css'])
    .pipe($.modernizr())
    .pipe(gulp.dest('_tmp/scripts'))
});

// Move images over
gulp.task('clean:img', function(cb) {
  del(['assets/images/**/*.*', '_tmp/images/**/*.*'], cb);
});

gulp.task('img', ['clean:img'], function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('_tmp/images'));
});


// Replace names in templates with fingerprinted file names for cache-busting
gulp.task('clean:rev', function(cb) {
  del('rev-manifest.json', cb);
});

gulp.task('rev', ['clean:rev'], function() {
  var rev = new $.revAll();
  var src = gulp.src('_tmp/**/*.*');

  if (isDist) {
    src.pipe(rev.revision())
      .pipe(gulp.dest('assets'))
      .pipe(rev.manifestFile())
      .pipe(gulp.dest(''));
  } else {
    src.pipe($.changed('assets', { hasChanged: $.changed.compareSha1Digest }))
      .pipe(gulp.dest('assets'))
      .pipe(reload({ stream: true }));
  }

  return src;
});


// Watch for file changes
gulp.task('watch', ['build'], function() {
  gulp.watch('src/js/**/*', function() {
    sequence('js', 'rev', reload);
  });
  gulp.watch('src/less/**/*', function() {
    sequence('css', 'rev');
  });
  gulp.watch('src/images/**/*', function() {
    sequence('img', 'rev');
  });
  gulp.watch('templates/**/*', function() {
    sequence('rev', reload);
  });

  // Keypress logic
  keypress(process.stdin);

  process.stdin.on('keypress', function (ch, key) {
    // Ctrl+C means close
    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }

    // Modernizr rebuild
    if (key.name == 'm') {
      sequence('modernizr', 'rev');
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
});

gulp.task('htaccess', function() {
  gulp.src('src/htaccess', { base: 'src' })
    .pipe($.rename('.htaccess'))
    .pipe($.if(isDist, gulp.dest('assets')));
});

// Just build the thing
gulp.task('clean:build', function(cb) {
  del(['_tmp', 'assets'], cb);
});

gulp.task('build', ['clean:build'], function() {
    sequence(['htaccess', 'js', 'css', 'img'], 'modernizr', 'rev');
});

gulp.task('serve', function() {
  isServing = true;
  browserSync.init({
    proxy: process.env.DEVELOPMENT_URL,
    open: false,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: true
    }
  });
  sequence('watch');
});

gulp.task('default', ['serve']);
