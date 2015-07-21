'use strict';
{% if theme.js == 'browserify' %}var $ = require('jquery');
var bulk = require('bulk-require')

{% endif -%}
var {{ shortName }} = {
  contexts: { }
};

{{ shortName }}.contexts.common = function common() {

};

{{ shortName}}.run = function () {
  var main = {{ shortName }};
  main.ready = function ready() {
    main.contexts.common();
    var classes = $('body').attr('class').replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }).split(/\s+/);
    classes.forEach(function (item) {
      if (main.contexts[item]) {
        main.contexts[item]();
      }
    });
  };

  $(document).ready(main.ready);
};
{% if theme.js == 'browserify' %}
module.exports = {{ shortName }};

bulk(__dirname, './contexts/*.js');
{% else %}
{{ shortName }}.run();
{% endif %}
