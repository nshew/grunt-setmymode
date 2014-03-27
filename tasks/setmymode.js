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
	  grunt.log.writeln("options = " + this.options());

//    this.requiresConfig(this.name + ".options.directory");

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      modeDirs:  "2771",
      modeFiles: "0664"
    });
	  grunt.log.writeln("options.directory = " + options.directory);

    // make sure directory has a trailing slash for proper glob
    if (options.directory.slice(-1) != "/") {
      options.directory += "/";
    }

    var fs   = require("fs");   // Node file system API
    var glob = require("glob"); // https://github.com/isaacs/node-glob
    var elementStat;
    var i;

    /*
     * As an unprivileged user, you can only chmod your own files.
     * To determine what you own, first determine your UID.
     */
    var currentUID = process.getuid();

    // get all files and directories under target directory
    var contentsArray = glob.sync(options.directory + "**", { mark: true });
	  grunt.log.writeln("contentsArray = " + grunt.log.wordlist(contentsArray));

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
      var octalMode = statMode.toString(8).substr(-4);
      // pad to 4 chars (toString drops leading 0s) and return
      return new Array(5 - octalMode.length).join("0") + octalMode;
    };

    var setMode = function (element, stat, mode)
    {
      if (statMode2Octal(stat.mode) !== mode) {
        try {
          fs.chmodSync(element, mode);
          grunt.log.writeln(element + " set to mode " + mode);
        } catch (error) {
          grunt.log.error("unable to set mode of " + element);
        }
      } else {
        grunt.verbose.writeln(element + " already had mode " + mode);
      }
    };

    // ensure sort, because order may matter with directory permissions
    contentsArray.sort();

    // process contentsArray
    for (i=0; i<contentsArray.length; i++) {
      elementStat = fs.statSync(contentsArray[i]);

      // check if I own this element
      if (elementStat.uid == currentUID) {

        if (elementStat.isFile()) {
          setMode(contentsArray[i], elementStat, options.modeFiles);
        }
        else if (elementStat.isDirectory()) {
          setMode(contentsArray[i], elementStat, options.modeDirs);
        }
      }
    };
  });

};
