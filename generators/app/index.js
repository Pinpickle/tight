'use strict';
var chalk = require('chalk');
var yosay = require('yosay');
var slug = require('slug');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var lib = require('../../lib');
var nunjucks = require('nunjucks');

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
        default: 'Cool Website',
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
        default: 'Cool'
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
        default: 'CoolCo',
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
        message: 'Describe this project in a few words'
      }, {
        type: 'input',
        name: 'username',
        message: 'What is your name?',
        store: true
      }, {
        type: 'input',
        name: 'email',
        message: 'What is your email?',
        store: true
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

    composer: function () {
      this.log(chalk.red('Running Composer now. Make sure you have it installed!'));

      var done = this.async();

      // Sorry Yeoman, need to get this on the file system
      fs.writeFileSync(this.destinationPath('composer.json'), nunjucks.renderString(fs.readFileSync(this.templatePath('composer.json')).toString(), this.props));


      var installBolt = function () {
        var bolt = this.spawnCommand('composer', ['bolt-update']);
        bolt.on('close', function () {
          done();
        });
      }.bind(this);

      if (this.options.dontCompose) {
        installBolt();
      } else {
        var install = this.spawnCommand('composer', ['install']);
        install.on('close', installBolt);
      }
    },

    webroot: function () {
      var done = this.async();

      // Try to detect webroot
      var directories = fs.readdirSync(this.destinationPath()).filter(function (file)  {
        return ((!_.contains(['app', 'extensions', 'vendor', 'node_modules'], file)) && (fs.statSync(path.join(this.destinationPath(), file)).isDirectory()));
      }.bind(this));

      if (_.contains(directories, 'files')) {
        // Webroot is the same directory
        this.log(chalk.green('Detected: webroot in same folder.'));
        this.props.webroot = '';
        done();
      } else {
        if (directories.length === 1) {
          // There was only one extra directory, it must be webroot
          this.log(chalk.green('Detected: webroot in ' + directories[0] + '.'));
          this.props.webroot = directories[0];
          done();
        } else {
          // More than one extra directory, ask the user
          this.log(chalk.red('Could not detect your webroot folder. Sorry, could you please enter it again?'));
          this.prompt([{
            type: 'input',
            name: 'webroot',
            message: 'What is your webroot folder?',
            default: directories[0]
          }], function (props) {
            this.props.webroot = props.webroot;
            done();
          }.bind(this));
        }
      }
    },

    subGenerators: function () {
      this.config.set(this.props);
      this.config.save();
      //this.config.save();

      this.composeWith('tight:extension', {
        local: require.resolve('../extension')
      });

      this.composeWith('tight:theme', {
        local: require.resolve('../theme')
      });
    }
  },

  writing: {
    app: function () {
      this.fastTemplate(['composer-update.sh', 'composer.json', 'gulpfile.js', 'package.json', 'README.md',
                         { editorconfig: '.editorconfig', env: '.env', gitignore: '.gitignore', htaccess: '.htaccess' }]);
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
    this.npmInstall();
    this.spawnCommand('composer', ['install'], {
      cwd: path.join(this.destinationRoot(), 'extensions')
    });
  }
});
