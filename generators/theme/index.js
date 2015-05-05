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
      this.destinationRoot(path.join('..', truepath));
    } else {
      this.destinationRoot(path.join('..', this.props.webroot, truepath));
    }

    this.fastTemplate = function (files) {
      lib.fastTemplate(this, files);
    };

    console.log(this);
  },

  initializing: function () {
    this.pkg = require('../../package.json');
    this.log(chalk.green.underline('Creating theme...'));
  },

  prompting: function () {
    var done = this.async();

    var prompts = [{
      type: 'list',
      name: 'js',
      message: 'How do you want to manage JS modules?',
      choices: [
        { name: 'Plain JS', value: 'js' },
        { name: 'Browserify', value: 'browserify' }/*,
        { name: 'RequireJS', value: 'requirejs' }*/
      ],
      store: true
    }, {
      type: 'list',
      name: 'css',
      message: 'Do you want to use a CSS preprocessor?',
      choices: [
        { name: 'No, plain CSS please (comes with postprocessor)', value: 'css' },
        { name: 'LESS', value: 'less' }/*,
        { name: 'SASS', value: 'sass' },
        { name: 'Stylus', value: 'stylus'}*/
      ],
      store: true
    }, {
      type: 'list',
      name: 'package',
      message: 'What do you want to use to manage client dependencies?',
      choices: [
        { name: 'Bower', value: 'bower' },
        { name: 'npm', value: 'npm' },
        { name: 'Both', value: 'both' }
      ],
      store: true
    }];

    this.prompt(prompts, function (props) {
      this.props.theme = props;
      this.config.set({ theme: props });
      this.config.save();

      done();
    }.bind(this));
  },

  writing: {
    files: function () {
      this.directory('templates', 'templates');
      if (this.props.theme.css === 'less') {
        this.directory('src/less', 'src/less');
      } else {
        this.directory('src/css', 'src/css');
      }

      this.directory('src/images', 'src/images');

      this.fastTemplate(['bower.json', 'config.yml', 'gulpfile.js', 'package.json', 'src/htaccess', 'src/js/main.js', 'src/js/modules/example-module.js', 'src/js/contexts/page-home.js',
                         {gitignore: '.gitignore', bowerrc: '.bowerrc', env: '.env'}]);
    }
  }
});
