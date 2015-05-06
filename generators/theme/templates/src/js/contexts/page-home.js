{% if theme.js == 'browserify' %}var $ = require('jquery');
var {{ shortName }} = require('../main.js');

{% endif %}{{ shortName }}.contexts.pageHome = function () {
  // Any special home page logic goes here!
};
