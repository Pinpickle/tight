# {{ name }}

This website is running on [Bolt](http://bolt.cm).

If you've just downloaded this repository (not generated it), you'll need to install all of the dependencies.

Make sure that you have [Node.js](https://nodejs.org/) and [Composer](https://getcomposer.org/) installed. Then you'll need to install [Gulp](http://gulpjs.org) globally, and any dependencies of the project.

    npm install -g gulp
    npm install
    composer install

## Theme

You'll need to build the theme as well. Head over to the theme directory in {% if webroot != '' %}{{ webroot }}/{% endif %}theme/{{ lowerShortName }} and read the readme over there to figure out how to do that.

## Extensions

This comes bundled with a custom extension. Navigate to extensions/local/{{ owner }}/{{ lowerShortName }} to figure out how it works. 

## Setting Up Bolt

Set up your Apache webserver to point towards the web directory, and then navigate to it. You'll be prompted to set up your first user - do it and then the website is ready to go! Need more information? Go to [the Bolt Docs](http://docs.bolt.cm).

You'll probably want to install the third party extensions that we've included. In Bolt, head to the "Extend" panel on the right and then click "Install All Extensions".

## Deploying

This has a gulpfile that is ready to deploy your website via FTP. Want to use a different deployment method? How secure! You'll have to modify the current setup, check gulpfile.js for how the internals work.

There are two methods of deployment, deploying just the theme (because you'll probably do that most), and deploying the entire application.

There is a `.env` file here that you will need to edit to configure the credentials for FTP. It's not commited to Git, so it won't end up online or anything (which is good).

### Theme Deployment

Make sure the theme has been built with the `--dist` flag (see the theme readme), and then just run the following command in this folder.

    gulp deploy:theme

This deployment script is optimised so that only changed files will be uploaded, for maximum speed.

### App Deployment

With all of its dependencies, there are a lot of files to deploy if you're deploying the entire application. There is a gulp task that will create an optimised version of the website, and then bundle it up in a zip file, ready to be uploaded. Once its uploaded, you'll have to use another tool to unzip it. Execute the following command in this folder.

    gulp bundle

You'll end up with a `dist` folder, and inside it will be the optimised application and a `{{ lowerShortName }}-bundle.zip`. You can use your favourite FTP application to upload this, or you can use the gulp task.

    gulp deploy:app

Following this, the file will need to be unzipped on the server side. If you're using a host with cPanel, its file manager usually has an unzip function. If you don't have access to it, you can very quickly upload the following script as `unzip.php`, and then execute it.

    <?php system('unzip -o {{ lowerShortName }}-bundle.zip');

Make sure to delete this afterwards! The zip file will be hidden by your htaccess file, but it's best to delete that off the server as well.

If you haven't already, you'll need to put your database details in `app/config/config_local.yml` on the server side. And also set up Bolt like you have on this side.
