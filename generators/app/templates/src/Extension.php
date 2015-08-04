<?php

namespace {{ owner }}\{{ shortName }};

use Bolt\Application;
use Bolt\BaseExtension;

class Extension extends BaseExtension {
    protected $loader;
    protected $twigHelper;

    public function initialize() {
        $this->initializeTwig();
        $this->twigHelper = new TwigHelper($this->app, $this);
        $this->twigHelper->addTwigFunctions($this->twigExtension);
    }

    public function getName() {
        return "{{ name }} Extension";
    }
}
