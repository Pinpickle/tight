'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var slug = require('slug');
var fs = require('fs');

module.exports = yeoman.generators.NamedBase.extend({

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

      var prompts = [{
        type: 'input',
        name: 'projectName',
        message: 'Name (e.g. my-website). No capitals.',
        default: function (props) {
          return this.name.toLowerCase();
        }.bind(this),
        validate: function (input) {
          if (input === '') {
            return 'Name cannot be blank!'
          }

          return true;
        }
      }, {
        type: 'input',
        name: 'safeName',
        message: 'Safe name (e.g. MyWebsite). Short, UpperCamelCase, numbers and letters.',
        validate: function validate(input) {
          if (input === '') {
            return 'Name cannot be blank!'
          }

          if (!(/^([A-Za-z0-9\-\_])+$/.test(input))) {
            return 'No weird characters!';
          }

          return true;
        },
        default: function (props) {
          return slug(props.projectName, {
            replacement: '',
            remove: /\-|\_|\./g
          });
        }
      }, {
        type: 'input',
        name: 'owner',
        message: 'Who does this belong to? (For namespaces)',
        validate: function validate(input) {
          if (input === '') {
            return 'Name cannot be blank!'
          }

          if (!(/^([A-Za-z0-9\-\_])+$/.test(input))) {
            return 'No weird characters!';
          }

          return true;
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
          return 'https://github.com/' + slug(props.owner) + '/' + props.projectName;
        }
      }];

      this.prompt(prompts, function (props) {
        this.props = props;
        this.name = props.projectName;


        done();
      }.bind(this));
    },
    composer: function () {
      this.log(chalk.red('Running Composer now. Make sure you have it installed!'));

      var done = this.async();

      // Sorry Yeoman, need to get this on the file system
      fs.writeFileSync(this.destinationPath('composer.json'), this.engine(fs.readFileSync(this.templatePath('composer.json')).toString(), this.props));

      var install = this.spawnCommand('composer', ['install']);
      install.on('close', function () {
        var bolt = this.spawnCommand('composer', ['bolt-update']);
        bolt.on('close', function () {
          done();
        });
      }.bind(this));
    }
  },

  writing: {
    /*app: function () {
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
      );
      this.fs.copy(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json')
      );
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
    }*/
  },

  install: function () {
    this.installDependencies();
  }
});
