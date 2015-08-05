'use strict';
var chalk = require('chalk');
var yosay = require('yosay');
var slug = require('slug');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var lib = require('../../lib');
var nunjucks = require('nunjucks');
var glob = require('glob');

module.exports = lib.TightGenerator.extend({
  constructor: function () {
    lib.TightGenerator.apply(this, arguments);

    this.option('dontCompose');
  },

  initializing: function () {
    this.pkg = require('../../package.json');
  },

  prompting: {
    init: function () {
      var done = this.async();


      // Have Yeoman greet the user.
      this.log(yosay(
        'Tighten that Bolt! Welcome to the ' + chalk.red('Tight') + ' generator!'
      ));

      this.log(chalk.underline.blue('We\'re going to ask for some names for your project. Only numbers and letters (and sometimes spaces) for these.') + '\n\n' +
               'The first is the real name for it - please use spaces and title case for it. We will handle slugification and camelCase where appropiate. \n\n' +
               'The second is a short name, which you\'ll be typing a lot. Use UpperCamelCase for this. No spaces. \n\n' +
               'The last is your namespace, which is used in a few places. This UpperCamelCase string represents you or your organisation.');

      var prompts = [{
        type: 'input',
        name: 'name',
        message: 'Name',
        default: 'Tight Website',
        validate: function (input) {
          if (input === '') {
            return 'Name cannot be blank!';
          }

          return true;
        }
      }, {
        type: 'input',
        name: 'shortName',
        message: 'Short Name',
        validate: function validate(input) {
          if (!(/^([A-Za-z0-9\-\_])+$/.test(input))) {
            return 'No weird characters!';
          }

          return true;
        },
        default: 'Tight'
      }, {
        type: 'input',
        name: 'owner',
        message: 'Namespace',
        validate: function validate(input) {
          if (!(/^([A-Za-z0-9\-\_])+$/.test(input))) {
            return 'No weird characters!';
          }

          return true;
        },
        default: 'TightCo',
        store: true
      }, {
        type: 'input',
        name: 'devUrl',
        message: 'What URL will this use for development?',
        default: function (input) {
          return 'http://localhost/' + input.shortName.toLowerCase();
        }
      }, {
        type: 'input',
        name: 'license',
        message: 'What license does this use?',
        default: 'None'
      }, {
        type: 'input',
        name: 'description',
        message: 'Describe this project in a few words',
        default: 'A tight description'
      }, {
        type: 'input',
        name: 'username',
        message: 'What is your name?',
        store: true,
        default: 'MrTight'
      }, {
        type: 'input',
        name: 'email',
        message: 'What is your email?',
        store: true,
        default: 'tight@tight.co'
      }, {
        type: 'input',
        name: 'repository',
        message: 'Where does this live online?',
        default: function (props) {
          return 'https://github.com/' + slug(props.owner) + '/' + slug(props.name, '-');
        }
      }];

      this.prompt(prompts, function (props) {
        this.props = props;
        this.props.hyphenName = slug(props.name, '-').toLowerCase();
        this.props.camelName = slug(props.name
          .replace(/^(\s*)(.+)(\s*)$/g, function (g) { return g[2]; }) // Remove trailing spaces
          .replace(/\s+(.)/g, function (g) { return g[1].toUpperCase(); }), // Camel case
          '-'); //Slugify
        this.props.upperCamelName = this.props.camelName.charAt(0).toUpperCase() + this.props.camelName.slice(1);
        this.props.lowerShortName = this.props.shortName.toLowerCase();
        this.name = props.name;

        done();
      }.bind(this));
    },

    site: function () {
      this.log(chalk.green('We\'re going to ask whether you want a public web directory inside your root. Leave it blank to use your root as your web directory.'));

      var done = this.async();

      var prompts = [
        {
          type: 'input',
          name: 'webroot',
          message: 'Where do you want your webroot to be?',
          default: ''
        }
      ]

      this.prompt(prompts, function (props) {
        var root  = props.webroot;

        if ((root == '.') || (root == './')) {
          root = '';
        }

        this.props.webroot = root;

        done();
      }.bind(this));
    },

    subGenerators: function () {
      this.config.set(this.props);
      this.config.save();

      this.composeWith('tight:theme', {
        local: require.resolve('../theme')
      });
    }
  },

  writing: {
    app: function () {
      this.fastTemplate([
        'composer.json', 'gulpfile.js', 'package.json', 'README.md', 'src/Extension.php', 'src/TwigHelper.php',
        {
          editorconfig: '.editorconfig',
          env: '.env',
          gitignore: '.gitignore',
          htaccess: path.join(this.props.webroot, '.htaccess'),
          'index.php': path.join(this.props.webroot, 'index.php'),
          'favicon.ico': path.join(this.props.webroot, 'favicon.ico')
        }
      ]);
    },

    configfiles: function () {
      this.fastTemplate({
        'config/config.yml': 'app/config/config.yml',
        'config/config_local.yml': 'app/config/config_local.yml',
        'config/contenttypes.yml': 'app/config/contenttypes.yml',
        'config/routing.yml': 'app/config/routing.yml',
        'config/sitemap.bolt.yml': 'app/config/extensions/sitemap.bolt.yml'
      });
    }
  },

  install: function () {
    var done = this.async();

    if (this.options.skipInstall) {
      done();
      return;
    }

    var themePath = path.join(this.destinationRoot(), 'theme');

    this.log(chalk.green('Running npm install'));
    this.command('npm', ['install'], {
      cwd: this.destinationRoot()
    }).then(function () {
      this.log(chalk.green('Running composer install'));
      return this.command('composer', ['install'], {
        cwd: this.destinationRoot()
      });
    }.bind(this)).then(function () {
      this.log(chalk.green('Updating Bolt assets'));
      return this.command('composer', ['bolt-update'], {
        cwd: this.destinationRoot()
      });
    }.bind(this)).then(function () {
      this.log(chalk.green('Installing Bolt extensions'));
      return this.command('php', ['vendor/bin/nut', 'extensions:install', 'bolt/sitemap', '*.*.*'], {
        cwd: this.destinationRoot()
      });
    }.bind(this)).then(function () {
      this.log(chalk.green('Running npm install for theme'));
      return this.command('npm', ['install'], {
        cwd: themePath
      });
    }.bind(this)).then(function () {
      this.log(chalk.green('Building your theme'));
      return this.command('gulp', ['build'], {
        cwd: this.destinationRoot()
      });
    }.bind(this)).then(function () {
      this.log(chalk.green('Fixing file permissions'));
      var ignore = ['**/node_modules/**', '**/vendor/**'];

      return Promise.all([
        // Set directories to 775
        new Promise(function(resolve, reject) {
          glob('**/', {
            cwd: this.destinationPath(),
            ignore: ignore
          }, function () {
            resolve();
          }).on('match', function (m) {
            try {
              fs.chmodSync(m, '775')
            } catch (e) {
              // Swallowing
            }
          });
        }.bind(this)),
        // Set files to 664
        new Promise(function(resolve, reject) {
          glob('**', {
            cwd: this.destinationPath(),
            ignore: ignore,
            nodir: true
          }, function () {
            resolve();
          }).on('match', function (m) {
            try {
              fs.chmodSync(m, '664')
            } catch (e) {
              // Swallowing
            }
          });
        }.bind(this))
      ]);
    }.bind(this)).then(function () {
      done();
    }).done();
  }
});
