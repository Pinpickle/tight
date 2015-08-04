/**
 * Here you should use application-wide code. Maybe some networking stuff, or init
 * code.
 */

 {% if theme.js == 'browserify' %}
 'use strict';
 var {{ shortName }} = require('{{ shortName.toLowerCase() }}');

 module.exports = function () {
   // Do something interesting
 };
 {% else %}
 {{ shortName }}.niftyModule = function () {
   // Do something interesting
 };
 {% endif %}
