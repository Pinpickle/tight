<?php
namespace {{ owner }}\{{ shortName }};

/**
 * Return false if the requested file is available on the filesystem.
 * @see: http://silex.sensiolabs.org/doc/web_servers.html#php-5-4
 */
if (php_sapi_name() === 'cli-server') {
    $filename = __DIR__ . preg_replace('#(\?.*)$#', '', $_SERVER['REQUEST_URI']);
    if (is_file($filename)) {
        return false;
    }
}

// Load all libraries
require_once __DIR__ . '{% if webroot != '' %}/..{% endif %}/vendor/autoload.php';

// Boilerplate for a "Composer" Bolt configuration
$configuration = new \Bolt\Configuration\Composer(__DIR__{% if webroot != '' %} . '/../'{% endif %});

$configuration->getVerifier()->disableApacheChecks();
$configuration->verify();

/**
 * Create Bolt application instance
 * @var \Bolt\Application $app
 */
$app = new \Bolt\Application(array('resources'=>$configuration));
$app->initialize();

// Redirect theme calls to `theme-assets/`
$configuration->setUrl('theme', $configuration->getUrl('root') . 'theme-assets/');

// Add in our extension
$app['extensions']->register(new Extension($app));

// Serve your website
$app->run();
