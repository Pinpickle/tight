<?php
namespace {{ owner }}\{{ shortName }};

require_once "{% if webroot != '' %}../{% endif %}vendor/autoload.php";

$configuration = new \Bolt\Configuration\Composer(__DIR__);

$configuration->setPath('themebase', '');

$configuration->getVerifier()->disableApacheChecks();
$configuration->verify();

$app = new \Bolt\Application(array('resources'=>$configuration));
$app->initialize();

$configuration->setUrl('theme', $configuration->getUrl('root') . 'theme-assets/');

$app['extensions']->register(new Extension($app));

$app->run();
