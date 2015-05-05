<?php

namespace Bolt\Extension\<%= owner %>\<%= shortName %>;

use Bolt\Application;
use Bolt\BaseExtension;
use Symfony\Component\ClassLoader\Psr4ClassLoader;

class Extension extends BaseExtension {
    protected $loader;

    public function initialize() {
        $this->loader = new Psr4ClassLoader();
        $this->loader->addPrefix('Bolt\\Extension\\<%= owner %>\\<%= shortName %>', __DIR__ . '/src');
        $this->loader->register();
    }

    public function getName() {
        return "<%= name %> Extension";
    }
}
