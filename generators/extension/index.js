'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var lib = require('../../lib');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.props = this.config.getAll();

    var truepath = path.join('extensions', 'local', this.props.owner.toLowerCase(), this.props.shortName.toLowerCase());
    this.destinationRoot(truepath);

    this.fastTemplate = function (files) {
      lib.fastTemplate(this, files);
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
