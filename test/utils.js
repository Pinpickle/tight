'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var spawn = require('child_process').spawn;
var fs = require('fs');
var os = require('os');
var crypto = require('crypto');
var Browser = require('zombie');
var portfinder = require('portfinder');
var mkdirp = require('mkdirp');
var del = require('del');
var argv = require('yargs').argv;
var _ = require('lodash');

// Make sure we kill child processes when we exit
var cleanExit = function() { process.exit() };
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill

/**
 * Starts the server on a free port
 *
 * @returns Promise - Resolves with the Browser object with an extra property,
 * `phpServer` that is the process of the PHP server being run
 */
exports.startServer = function startServer(webroot) {
  return new Promise(function(resolve, reject) {
      portfinder.getPort({ host: '127.0.0.1' }, function (err, port) {
        var home = '127.0.0.1:' + port;
        console.log('Listening on ' + home + ' in directory ' + webroot);
        var server = spawn('php', ['-d', 'session.save_path="./_sess"', '-S', home, '-t', webroot || '.', path.join(webroot, 'index.php')], { stdio: ['ignore', 'ignore', 'ignore'] });

        var browser = new Browser();
        browser.site = home;
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
};

/**
 * Stops the server
 *
 * @param object browser - the Browser object returned from stopServer
 */
exports.stopServer = function stopServer(browser) {
  browser.phpServer.kill('SIGINT');
};

/**
 * Generates a new app in a random location
 *
 * @returns Promise - Same as startServer
 */
exports.generateApp = function generateApp(opts) {
  var gen = helpers.run(path.join(__dirname, '../generators/app'), { tmpdir: false });
  var ready = gen.async();
  opts = _.merge({ }, {
    generatorOpts: { skipInstall: false, force: true },
    generatorPrompts: { },
    webroot: ''
  }, opts);

  opts.generatorPrompts.webroot = opts.webroot;

  // We want a tmp dir to work in to create an environment separate from
  // the development one. However, we want to be able to re-use that directory
  // as well. So the default Yeoman tmpdir is not satisfactory
  var testdirnameFile = path.join(__dirname, '.testdirname');

  try {
    var tmp = fs.readFileSync(testdirnameFile).toString();
  } catch (e) {
    var tmp = 'tight-' + crypto.randomBytes(20).toString('hex');
    fs.writeFileSync(testdirnameFile, tmp);
  }

  var testDir = path.join(os.tmpdir(), tmp);
  mkdirp.sync(testDir);
  process.chdir(testDir);

  // Remvoe the database to check user creation
  // Remove index.php to avoid some false positives
  del.sync(['./app/database/bolt.db', './index.php']);

  gen.withOptions(opts.generatorOpts)
    .withPrompts(opts.generatorPrompts)
    .withGenerators([ path.join(__dirname,'../generators/theme') ]);

  var browser;

  return new Promise(function(resolve, reject) {
    gen.on('end', resolve);
    ready();
  }).then(function () {
    return exports.startServer(path.join(process.cwd(), opts.webroot));
  }).then(function (b) {
    browser = b;
    return browser.visit('/');
  }).then(function () {
    return browser;
  }).catch(function (e) {
    throw e;
  });
};

if (argv.createServer) {
  exports.generateApp({ webroot: argv.webroot });
}
