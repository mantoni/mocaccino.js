/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through');
var resolve = require('resolve');
var path    = require('path');
var fs      = require('fs');


module.exports = function (b, opts) {
  if (!opts) {
    opts = {};
  }
  var reporter = opts.reporter || opts.R || 'tap';
  var yields = opts.yields || opts.y || 250;
  var ui = opts.ui || opts.U || 'bdd';
  var timeout = opts.timeout || opts.t || 2000;
  var setupFile;
  if (opts.node) {
    b.exclude('mocha');
    setupFile = 'setup-node.js';
  } else {
    b.noParse(require.resolve('mocha/mocha'));
    setupFile = 'setup-browser.js';
  }
  setupFile = path.join(__dirname, setupFile);

  // Transform must be global to make sure it is applied last:
  b.transform({ global : true }, function (file) {
    if (file === setupFile) {
      var content = '';
      return through(function (buf) {
        content += buf;
      }, function () {
        var windowWidth = process.stdout.getWindowSize ?
            process.stdout.getWindowSize()[0] : 80;
        this.queue(content
          .replace('{{WINDOW_WIDTH}}', JSON.stringify(windowWidth))
          .replace('{{REPORTER}}', reporter)
          .replace('{{YIELDS}}', yields)
          .replace('{{UI}}', ui)
          .replace('{{TIMEOUT}}', timeout));
        this.queue(null);
      });
    }
    if (b.files.indexOf(file) === -1) {
      return through();
    }
    var script = '';
    return through(function (data) {
      this.queue('require(' + JSON.stringify(setupFile) + ');');
      script += data;
    }, function () {
      if (opts.node) {
        this.queue(script);
      } else {
        this.queue(script.replace(/require\(['"]mocha['"]\)/g, 'Mocha'));
      }
      this.queue(null);
    });
  });
};
