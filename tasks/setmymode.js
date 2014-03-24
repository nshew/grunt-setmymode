/*
 * grunt-setmymode
 * https://github.com/NShewmaker/grunt-setmymode
 *
 * Copyright (c) 2014 Nicholas Shewmaker
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {
  grunt.registerMultiTask("setmymode", "finds all files and directories under a given directory, and sets their permissions if owned by executing user", function() {

    grunt.verbose.subhead(this.name);
    this.requiresConfig("setmymode.options.directory");
    this.requiresConfig("setmymode.options.modeDirs");
    this.requiresConfig("setmymode.options.modeFiles");

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      modeDirs:  "2771",
      modeFiles: "0664"
    });

    var fs         = require("fs"); // Node file system API;
    var subdirs    = [];
    var uniqueDirs = [];
    var uniquePaths;

    /*
     * As an unprivileged user, you can only chmod your own files.
     * To determine what you own, first determine your UID.
     */
    var currentUID = process.getuid();

    /**
     * This function converts the mode reported by stat to
     * the familiar octal format used by chmod. Because we
     * allow for the setuid and setgid bit, the result is
     * padded to four characters.
     *
     * @param statMode numeric mode returned by stat
     * @returns {string}
     */
    var statMode2Octal = function (statMode)
    {
      // convert to expected octal
      //                          s  u  g  o
      var octalMode = (statMode & 111111111111).toString(8);
      // pad to 4 chars and return
      return new Array(5 - octalMode.length).join("0") + octalMode;
    };


    // get all files under target directory
    grunt.file.recurse(options.directory, function (abspath, rootdir, subdir, filename)
    {
      var fileStat = fs.statSync(abspath);

      /*
       * Check if I own this file and whether it already
       * has the desired mode before setting mode.
       */
      if (fileStat.uid  === currentUID) {
        if (statMode2Octal(fileStat.mode) !== options.modeFiles) {
          try {
            fs.chmodSync(abspath, options.modeFiles);
            grunt.verbose.writeln("file " + abspath + " set to mode " + options.modeFiles);
          } catch (error) {
            grunt.log.error("unable to set mode of file " + abspath);
          }
        } else {
          grunt.verbose.writeln("file " + abspath + " already had mode " + options.modeFiles);
        }
      }

      /*
       * Also create a list of subdirectories. Ownership
       * will be checked when the list is pared down.
       */
	  // TODO: What if you own the dir, but no files in/under it?
      if (subdir !== undefined) {
        subdirs.push(subdir);
      }
    });

    // filter the subdirectory list down to unique entries.
    // http://stackoverflow.com/a/14438954/356016
    uniquePaths = subdirs.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    /*
     * Now, split the path into individual directories, and
     * add those that I own to the final list.
     */
    uniquePaths.map(function(element) {
      var pathDirs = element.split("/");
      var dir = options.directory;
      var fileStat;
      var i;

      for (i=0; i<pathDirs.length; i++) {
        dir += pathDirs[i] + "/";

        fileStat = fs.statSync(dir);

        // store the directory, if I own it and it needs modification
        if (fileStat.uid === currentUID && statMode2Octal(fileStat.mode) !== options.modeDirs) {
          uniqueDirs.push(dir);
        }
      }
    });
    // prepend the target directory
    uniquePaths.unshift(options.directory);
    // rerun the unique operation
    uniqueDirs = uniqueDirs.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    // sort, because order may matter with directory permissions
    uniqueDirs.sort();

    uniqueDirs.map(function(element) {
      try {
        fs.chmodSync(element, options.modeDirs);
        grunt.verbose.writeln("directory " + element + " set to mode " + options.modeDirs);
      } catch (error) {
        grunt.log.error("unable to set mode of directory " + element);
      }
    });
  });

};
