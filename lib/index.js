'use strict';

var _ = require('lodash');

exports.fastTemplate = function (gen, files) {
  if (!Array.isArray(files)) {
    files = [files];
  }

  files.forEach(function(filepath) {
    if (!_.isObject(filepath)) {
      var loop = { };
      loop[filepath] = filepath;
    } else {
      loop = filepath;
    }
    _.forOwn(loop, function (dest, origin) {
      this.fs.copyTpl(
        this.templatePath(origin),
        this.destinationPath(dest),
        this.props
      );
    }.bind(this));
  }.bind(gen));
};
