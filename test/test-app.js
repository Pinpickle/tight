'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var Browser = require('zombie');
var portfinder = require('portfinder');
var mkdirp = require('mkdirp');
var del = require('del');
var utils = require('./utils');
var _ = require('lodash');

utils.setupDirectory();

describe('tight:app', function () {
  /**
   * Dynamically generate a test for different app circumstances
   */
  var describeApp = function(name, webroot, beforeCall) {
    describe(name, function () {
      var browser;

      before(function () {
        this.timeout(0);

        return utils.generateApp({ webroot: webroot }).then(function (b) {
            browser = b;

            return new Promise(function(resolve, reject) {
              beforeCall(resolve);
            });
          });
      });

      it('creates an index at webroot', function () {
        assert.file(path.join(webroot, 'index.php'));
      });

      it('can be visited', function () {
        browser.assert.success();
      });

      it('goes to the first user page', function () {
        browser.assert.text('title', 'Create the first user – Bolt');
      });

      it('can create first user', function () {
        this.timeout(10000);
        return browser
          .fill('#form_username', 'admin')
          .fill('#form_password', 'password')
          .fill('#form_password_confirmation', 'password')
          .fill('#form_email', 'test@tight.io')
          .fill('#form_displayname', 'Tight User')
          .pressButton('input[type=submit]')
          .then(function () {
            browser.assert.success();
          });
      });

      it('can log the user in', function () {
        this.timeout(10000);
        return browser
          .fill('#username', 'admin')
          .fill('#password', 'password')
          .pressButton('button[type=submit]')
          .then(function () {
            browser.assert.text('title', 'Dashboard – Bolt');
          });
      });

      after(function (done) {
        utils.stopServer(browser);
        done();
      });
    });
  };

  describeApp('webroot in subdirectory', 'public', function (cb) {
    cb();
  })

  describeApp('webroot as root', './', function (cb) {
    del(['./public'], cb);
  });

  describe('deploy script', function () {
    it('can bundle app', function (done) {
      this.timeout(0);
      spawn('gulp', ['bundle'], { stdio: 'inherit' }).on('exit', function () {
        done();
      });
    });

    // TODO: Add deploy parts, maybe with a mock FTP server?
    /*it('can deploy app', function () {

    });

    it('can deploy theme', function () {

    });*/
  });
});

describe.only('tight:theme', function () {
  /**
   * Dynamically generate tests for the theme
   */
  var describeTheme = function (name, prompts) {
    var browser;

    describe(name, function () {
      this.timeout(0);

      before(function () {
        return utils.generateTheme({ generatorPrompts: prompts })
          .then(function (b) {
            browser = b;
          });
      });

      it('creates a theme gulpfile', function () {
        assert.file('theme/gulp.js');
      });

      it('can be visited', function () {
        browser.assert.success();
      });

      it('creates a working template', function () {
        browser.assert.text('h1', 'Tight!');
      });

      after(function () {
        utils.stopServer(browser);
      })
    });
  };

  var permutations = {
    js: ['js', 'browserify'],
    css: ['css', 'less'],
    package: ['npm', 'bower', 'both']
  }

  permutations.js.forEach(function (jsName) {
    permutations.css.forEach(function (cssName) {
      permutations.package.forEach(function (packageName) {
        var describeName = 'js:' + jsName + ' css:' + cssName + ' pacakge:' + packageName;
        describeTheme(describeName, {
          js: jsName,
          css: cssName,
          package: packageName
        })
      })
    })
  })
});
