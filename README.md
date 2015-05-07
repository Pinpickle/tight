# Tight

Tighten that Bolt! This generator will set up [Bolt](http://bolt.cm) for you with a local extension and a feature-packed theme ready for you to make the best website the world has yet seen.

*Important!* This is not designed to be a "ready-to-deploy" theme. It is designed to be barebones boilerplate so you can get to making what you need to make.

## Installing and Running

You're going to need to have the command line version of [Composer](http://getcomposer.org) installed (so no `php composer.phar` business), and [Node.js/npm](http://nodejs.org). This uses [Yeoman](http://yeoman.io/) and [Gulp](http://gulpjs.com) (and potentially [Bower](http://bower.io)), so you're going to want to have those installed.

    npm install yo gulp bower -g

Then you're going to want to install this here generator

    npm install generator-tight

After that, you're ready to go! Make the directory you want to put the site in, `cd` into it, and then run the generator

    mkdir my-awesome-website
    cd my-awesome-website
    yo tight

## Bolt

Tight sets up Bolt sensibly. It works out the Composer install for you, and gives you some good default config options to roll with.

Note that, by default, we disable all default routes to listing, content and taxonomy pages. They're just commented out, so you can re-enable them really easily!

We've also got SEO built right in! The Sitemap extension is installed by default, and the theme can intelligently build metadata.

Ready to deploy? There are scripts for optimising the installation of Bolt for deployment by any means, but there is also an FTP deploy script baked right in.

## Theme

Powered by [Gulp](http://gulpjs.com). Full of file-system watching [BrowserSync](http://browsersync.io) action so that you never have to refresh your browser again. Edit a file, static assets are recompiled and injected into your browser. Easy.

Client dependencies can be managed with either [Bower](http://bower.io) or [npm](http://npmjs.org) (or both!).

JS can be written just as standard JS, or it can utilise [Browserify](http://browserify.org) for some good module management. RequireJS support is coming.

CSS can use a preprocessor (currently just [LESS](http://lesscss.org) but SASS support is coming), or you can use normal CSS. CSS comes with [cssnext](https://cssnext.github.io/) so you can use the CSS of the future, today! That means variables and other cool stuff. The LESS mode comes with some super simple classes to get you started - but you can just delete that.

The templates are set up so you don't have to write any more than you need to. We make good use of template inheritance so everything is extensible.

When you're ready for production, you can be comfortable knowing that your static assets will be minified, compressed and cached for a long time in the browser.

## Extension

This comes with a really simple local extension so you can author any custom PHP code for your website. It has a couple of custom twig functions required for the theme to work, but it also gets rid of all of that boilerplate and comes with its own autoloader!

## License

The MIT License (MIT)

Copyright (c) 2015 Christian Silver

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
