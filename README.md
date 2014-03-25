# grunt-setmymode

> finds all files and directories under a given directory, and sets their permissions if owned by executing user

## Why?

I work with several teammates on a shared development web server. As we deploy our code, it is important that we
can write to directories others have created and can overwrite files that the others may have installed. The
"mode" option of grunt-contrib-copy is insufficient for two main reasons:
   1. files and directories typically need different modes (see [enhancement #152](https://github.com/gruntjs/grunt-contrib-copy/issues/152))
   2. a `chmod` is attempted regardless of need. This fails on files that the current user doesn't own.

This plugin addresses both issues. It allows you to specify a mode each for files and directories,
and will only `chmod` on files the current user owns (the "my" in the plugin name), and only
when the mode isn't already at the given setting.

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-setmymode --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-setmymode');
```

## The "setmymode" task

### Overview
In your project's Gruntfile, add a section named `setmymode` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  setmymode: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.directory
Type: `String`
Default value: none

All files and directories under, and including, `directory` will have the appropriate mode applied.

#### options.modeDirs
Type: `String`
Default value: `2771`

the octal mode setting for directories

#### options.modeDirs
Type: `String`
Default value: `0664`

the octal mode setting for files

### Usage Examples

#### Default Options
In this example, the default options are used to set permissions on the `/var/www/myclient` web server directory.

```js
grunt.initConfig({
  setmymode: {
    options: {
      directory: "/var/www/myclient"
    },
    main: {}
  },
});
```

#### Custom Options
In this example, custom options are used to set permissions on the `/var/www/myclient` web server directory without the setgid bit.

```js
grunt.initConfig({
  setmymode: {
    options: {
      directory: "/var/www/myclient"
    },
    main: {
      modeDirs: "0771"
    }
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
