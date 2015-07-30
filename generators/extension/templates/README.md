# {{ name }} Extension

Bolt extensions are usually third party, but having your own local one is a great place to put all of your custom PHP code. Because you'll probably need it at some point.

This extension serves only a couple of purposes:

1. Skip all of that boilerplate required to write your own extension.
2. Provide two useful Twig filters/functions for your templates:
 - An `asset` function that allows you to link to assets in your theme easily, and also links to revved versions of file names
 - A `preg_replace` filter that allows you to use the standard PHP function in Twig.

All of the Twig code is in `src/TwigHelper.php`. For adding any other code, you'd want to start with `Extension.php` and take it from there.
