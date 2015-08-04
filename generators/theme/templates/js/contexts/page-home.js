{% if theme.js == 'browserify' %}'use strict';
var $ = require('jquery');
var {{ shortName }} = require('{{ shortName.toLowerCase() }}');

{% endif %}{{ shortName }}.contexts.pageHome = function () {
  // This code will be executed whenever the body element
  // has the 'page-home' class
};
