'use strict';

var yeoman = require('yeoman-generator');
var _ = require('lodash');
var nunjucks = require('nunjucks');
var path = require('path');

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
  }
});
