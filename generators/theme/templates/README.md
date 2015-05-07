# {{ name }} Theme

This theme does a lot for you - and that's great! First, make sure you have all of your dependencies installed

    npm install

{% if theme.bower -%}
This theme also uses Bower to manage dependencies. Make sure it's installed, and install your clientside dependencies.

    npm install -g bower
    bower install

{% endif -%}
## Building Your Theme

To just build the theme (which needs to be done for every change) just run

    gulp build

## Watching for changes, and injecting them

Where things get fun is being able to edit your theme and have the changes appear on your website on the fly. This is the default Gulp task

    gulp

This will activate file system watching, and [BrowserSync](http://browsersync.io). If you make changes to any of your assets, they'll get compiled where necessary, and injected into your site.

**Important:** To be able to use this, you'll have to go through BrowserSync's proxy. When you run `gulp`, you'll be given a site URL (e.g. `http://localhost:3000`) that you can enter in order to access it. The Bolt backend, however, currently has some issues with that proxy so if you're accessing Bolt, make sure to not use the proxy (so get rid of the `:3000`).

## Other tasks

This comes with individual tasks for building your assets:

- `gulp css`
- `gulp js`
- `gulp images`

If you need to add more kinds of assets to parse, just write them into the gulpfile!

## Building for production

When in development, Gulp will skip over some tasks that aren't necessary, but those shouldn't be skipped in production. Add the `--dist` flag in any task to implement optimisations such as CSS & JS minification, file reving and long-life browser caches. *Do this whenever you deploy*.
