'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var lib = require('../../lib');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.props = this.config.getAll();

    var truepath = path.join('theme', this.props.shortName.toLowerCase());
    if (this.props.webroot === '') {
      this.destinationRoot(path.join(truepath));
    } else {
      this.destinationRoot(path.join(this.props.webroot, truepath));
    }

    this.fastTemplate = function (files) {
      lib.fastTemplate(this, files);
    };
  },

  initializing: function () {
    this.pkg = require('../../package.json');
    this.log(chalk.green.underline('Creating theme...'));
  },

  writing: {
    files: function () {
      this.directory('templates', 'templates');
      this.directory('src/less', 'src/less');
      this.directory('src/images', 'src/images');

      this.fastTemplate(['bower.json', 'config.yml', 'gulpfile.js', 'package.json', 'src/htaccess', 'src/js/main.js',
                         {gitignore: '.gitignore', bowerrc: '.bowerrc'}]);
    }
  }
});
