{% if theme.js == 'browserify' %}'use strict';
var {{ shortName }} = require('./{{ shortName.toLowerCase() }}');
{% endif %}{{ shortName }}.run();
