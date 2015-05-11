'use strict';
var chalk = require('chalk');
var path = require('path');
var lib = require('../../lib');

module.exports = lib.TightGenerator.extend({
  constructor: function () {

    lib.TightGenerator.apply(this, arguments);

    this.props = this.config.getAll();

    var truepath = path.join('theme', this.props.shortName.toLowerCase());
    if (this.props.webroot === '') {
      this.pathPrefix = path.join(truepath);
    } else {
      this.pathPrefix = path.join(this.props.webroot, truepath);
    }
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
        this.directory('src/less', 'src/less');
      } else {
        this.directory('src/css', 'src/css');
      }

      this.directory('src/images', 'src/images');

      this.fastTemplate(['config.yml', 'gulpfile.js', 'package.json', 'README.md', 'src/htaccess', 'src/js/modules/example-module.js', 'src/js/contexts/page-home.js',
                         {gitignore: '.gitignore', env: '.env', jshintrc: '.jshintrc', 'src/js/app.js': path.join('src/js', this.props.shortName.toLowerCase + '.js')}]);
      if (this.props.theme.js === 'browserify') {
        this.fastTemplate('src/js/main.js');
      }

      if (this.props.bower) {
        this.fastTemplate(['bower.json', { bowerrc: '.bowerrc' }]);
      }
    }
  },

  install: function () {
    var done = this.async();
    var themePath = path.join(this.destinationRoot(), this.pathPrefix);

    var install = this.spawnCommand('npm', ['install'], {
      cwd: themePath
    });
    install.on('close', function () {
      var gulp = this.spawnCommand('gulp', ['build'], {
        cwd: themePath
      });
      gulp.on('close', function () {
        done();
      });
    }.bind(this));
  }
});
