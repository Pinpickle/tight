'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var slug = require('slug');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.props = this.config.getAll();

    var truepath = path.join('extensions', 'local', this.props.owner.toLowerCase(), this.props.shortName.toLowerCase());
    this.destinationRoot(truepath);

    this.fastTemplate = function (files) {
      if (!Array.isArray(files)) {
        files = [files];
      }

      files.forEach(function(filepath) {
        this.fs.copyTpl(
          this.templatePath(filepath),
          this.destinationPath(filepath),
          this.props
        );
      }.bind(this));
    };
  },

  initializing: function () {
    this.pkg = require('../../package.json');
    this.log(chalk.green.underline('Creating extension...'));
  },

  writing: {
    files: function () {
      this.fastTemplate(['Extension.php', 'init.php', 'README.md', 'src/TwigHelper.php']);
    }
  }
});
