'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var spawn = require('child_process').spawn;
var os = require('os');
var Browser = require('zombie');
var home = 'http://localhost:8123';
var portfinder = require('portfinder');
var browser = new Browser();
browser.site = home;

// Make sure we kill child processes when we exit
//
var cleanExit = function() { process.exit() };
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

/**
 * Starts the server on a free port
 *
 * @returns Promise - Resolves with the Browser object with an extra property,
 * `phpServer` that is the process of the PHP server being run
 */
function startServer() {
  return new Promise(function(resolve, reject) {
      portfinder.getPort({ host: 'localhost' }, function (err, port) {
        var home = '0.0.0.0:' + port;

        var server = spawn('php', ['-S', home, '-t', '.', 'index.php'], { stdio: 'ignore' });

        var browser = new Browser();
        browser.site = 'localhost:' + port;
        browser.phpServer = server;

        // No matter what is tried, the stdout of PHP out will just not end up
        // in the server.stdout stream. Using { stdio: 'inherit' } displays the
        // output which is extra bizzare. Because of this, reliably detecting
        // when the server starts is impossible. This is why the following is
        // necessary.
        // Might be a node issue or a  PHP issue

        // HACK: Wait for PHP server to start
        setTimeout(function () {
          resolve(browser);
        }, 1000);
      });
  });
}

/**
 * Stops the server
 *
 * @param object browser - the Browser object returned from stopServer
 */
function stopServer(browser) {
  browser.phpServer.kill('SIGINT');
}

describe('tight:app', function () {
  var browser;

  before(function (done) {
    this.timeout(0);
    console.log('q');

    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ skipInstall: true })
      .withPrompts({ })
      .withGenerators([ path.join(__dirname,'../generators/theme') ])
      .on('end', function() {
        startServer().then(function (b) {
          console.log('d')
          browser = b;
          browser.visit('/');
        });
      });
  });

  it('can be visited', function () {
    browser.assert.success();
  });

  after(function (done) {
    stopServer(browser);
    done();
  });
});
