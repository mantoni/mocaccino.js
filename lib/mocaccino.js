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
  var setupFile;
  if (opts.node) {
    b.exclude('mocha');
    setupFile = 'setup-node.js';
  } else {
    setupFile = 'setup-browser.js';
  }
  setupFile = path.join(__dirname, setupFile);
  b.require(setupFile, { expose : 'mocaccino-setup' });

  // Transform must be global to make sure it is applied last:
  b.transform({ global : true }, function (file) {
    if (file === setupFile) {
      var content = '';
      return through(function (buf) {
        content += buf;
      }, function () {
        this.queue(content.replace('{{REPORTER}}', reporter));
        this.queue(null);
      });
    }
    if (b.files.indexOf(file) === -1) {
      return through();
    }
    return through(function (data) {
      this.queue('require("mocaccino-setup");');
      this.queue(data);
    });
  });

  var bundle = b.bundle;
  b.bundle = function () {
    var s = bundle.apply(this, arguments);
    var t = through();

    if (!opts.node) {
      resolve('mocha', function (err, mochaFile) {
        if (err) {
          throw err;
        }
        var m = fs.createReadStream(path.join(mochaFile, '..', 'mocha.js'));
        m.on('data', function (data) {
          t.write(data);
        });
        m.on('end', function () {
          s.pipe(t);
        });
      });
    } else {
      s.pipe(t);
    }

    return t;
  };
};
