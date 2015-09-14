var yeoman = require('yeoman-generator');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var path = require('path');
var Promise = require('promise');
var exec = require('child_process').exec;

nunjucks.configure({ watch: false });
exports.fastTemplate = function (gen, files) {
  if (!Array.isArray(files)) {
    files = [files];
  }

  files.forEach(function(filepath) {
    var loop;
    if (!_.isObject(filepath)) {
      loop = { };
      loop[filepath] = filepath;
    } else {
      loop = filepath;
    }
    _.forOwn(loop, function (dest, origin) {
      var self = this;
      this.fs.copy(
        this.templatePath(origin),
        this.destinationPath(path.join(this.pathPrefix, dest)), {
          process: function (contents) {
            try {
              return nunjucks.renderString(contents.toString(), self.props);
            } catch (e) {
              throw new Error(origin + ': ' + e.toString());
            }
            return contents;
          }
        }
      );
    }.bind(this));
  }.bind(gen));
};

exports.TightGenerator = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.pathPrefix = '';

    this.fastTemplate = function (files) {
      exports.fastTemplate(this, files);
    };

    var oldDirectory = this.directory;
    this.directory = function (source, dest) {
      oldDirectory.call(this, source, path.join(this.pathPrefix, dest));
    }.bind(this);

    this.command = function (command, args, opts) {
      return new Promise(function (resolve, reject) {
        this.spawnCommand(command, args, opts)
          .on('error', function (err) {
            reject(err);
          })
          .on('close', function (data) {
            resolve(true);
          });
      }.bind(this));
    };
  }
});

// https://github.com/mathisonian/command-exists
exports.commandExists = function(commandName) {
  return new Promise(function(resolve, reject) {
    var child = exec(commandName);
    var gotData = false;

    child.stdout.on('data', function() {
      gotData = true;
      child.kill();
    });

    child.stderr.on('data', function () {
      gotData = false;
      child.kill();
    });

    child.on('close', function() {
      resolve(gotData);
    });
  });
};
