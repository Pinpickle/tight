'use strict';
var chalk = require('chalk');
var path = require('path');
var lib = require('../../lib');

module.exports = lib.TightGenerator.extend({
  constructor: function () {

    lib.TightGenerator.apply(this, arguments);

    this.props = this.config.getAll();

    this.pathPrefix = 'theme';
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
      store: true,
      default: 'browserify'
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
      store: true,
      default: 'less'
    }, {
      type: 'list',
      name: 'package',
      message: 'What do you want to use to manage client dependencies?',
      choices: [
        { name: 'Bower', value: 'bower' },
        { name: 'npm', value: 'npm' },
        { name: 'Both', value: 'both' }
      ],
      store: true,
      default: 'npm'
    }];

    this.prompt(prompts, function (props) {
      props.bower = (props.package === 'bower') || (props.package === 'both');
      props.npm = (props.package === 'npm') || (props.package === 'bower');

      this.props.theme = props;

      done();
    }.bind(this));
  },

  writing: {
    files: function () {
      this.directory('templates', 'templates');
      if (this.props.theme.css === 'less') {
        this.directory('less', 'less');
      } else {
        this.directory('css', 'css');
      }

      this.directory('images', 'images');

      this.fastTemplate(['config.yml', 'gulp.js', 'package.json', 'README.md', 'htaccess', 'js/main.js', 'js/lib/example-module.js', 'js/contexts/page-home.js',
                         {gitignore: '.gitignore', env: '.env', jshintrc: '.jshintrc', 'js/app.js': path.join('js', this.props.shortName.toLowerCase() + '.js')}]);

      if (this.props.theme.js === 'browserify') {
        this.fastTemplate('js/main.js');
      }

      if (this.props.theme.bower) {
        this.fastTemplate('bower.json');
      }
    }
  },

  install: function () {
    // Installation is done in master generator to control execution order
  }
});
