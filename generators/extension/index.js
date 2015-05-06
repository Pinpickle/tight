'use strict';
var chalk = require('chalk');
var path = require('path');
var lib = require('../../lib');

module.exports = lib.TightGenerator.extend({
  constructor: function () {
    lib.TightGenerator.apply(this, arguments);

    this.props = this.config.getAll();

    this.pathPrefix = path.join('extensions', 'local', this.props.owner.toLowerCase(), this.props.shortName.toLowerCase());
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
