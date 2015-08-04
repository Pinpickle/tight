<?php

namespace {{ owner }}\{{ shortName }};

class TwigHelper {
    protected $manifest;
    protected $app;
    protected $extension;

    public function __construct($app, $extension) {
        $this->app = $app;
        $this->extension = $extension;
    }

    /**
     * Add all of the Twig functions and filters
     */
    public function addTwigFunctions($twigExtension) {
        $twigExtension->addTwigFilter(new \Twig_SimpleFilter('preg_replace', array($this, '_preg_replace')));
        $twigExtension->addTwigFunction(new \Twig_SimpleFunction('asset', array($this, 'gulpRevBust')));
    }

    /**
	 * Perform a regular expression search and replace.
	 *
	 * @param string $subject
	 * @param string $pattern
	 * @param string $replacement
	 * @param int $limit
	 * @return string
	 */
	public function _preg_replace($subject, $pattern, $replacement = '', $limit = -1)
	{
		if (!isset($subject)) {
			return null;
		}
		else {
			return preg_replace($pattern, $replacement, $subject, $limit);
		}
	}

    /**
     * @param string $accessorName
     * @param string $prefix - An optional string to
     * @return string
     */
    public function gulpRevBust($accessorName = '', $prefix = null) {
        if ($prefix === null) {
            $prefix = $this->app['resources']->getUrl('theme');
        }

        if (trim($accessorName) == '') {
            return '';
        }

        $fileName = $this->getManifestFileName();
        if (!file_exists($fileName)) {
            return $prefix . $accessorName;
        }

        if (!isset($this->manifest)) {
            $this->manifest = json_decode(file_get_contents($fileName), true);
        }

        $options = $this->manifest;

        return $prefix . (isset($options[$accessorName]) ? $options[$accessorName] : $accessorName);
    }

    /**
     * @return string
     */
    protected function getDefaultFilename() {
        return 'rev-manifest.json';
    }

    /**
     * @return string
     */
    protected function getManifestFileName()
    {
        // get location of our gulp-rev manifest file
        $file = isset($this->config['rev_file']) ? $this->config['rev_file'] : $this->getDefaultFilename();
        $filePath = $this->app['paths']['themepath'] . '/' . $file;
        return $filePath;
    }
}
