/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through   = require('through');
var resolve   = require('resolve');
var path      = require('path');
var setupFile = path.join(__dirname, 'setup.js');


module.exports = function (b, opts) {
  if (!opts) {
    opts = {};
  }
  var reporter = opts.reporter || opts.R || 'tap';
  if (opts.node) {
    b.ignore('brout');
    b.exclude('mocha');
  } else {
    var mochaFile = resolve.sync('mocha');
    b.require(path.join(mochaFile, '..', 'mocha.js'), { expose : 'mocha' });
  }
  b.require(setupFile, { expose : 'mocaccino-setup' });
  b.transform(function (file) {
    if (file === setupFile) {
      var content = '';
      return through(function (buf) {
        content += buf;
      }, function () {
        this.queue(content.replace('{{REPORTER}}', reporter));
        this.queue(null);
      });
    }
    return through(function (data) {
      this.queue('require("mocaccino-setup");');
      this.queue(data);
    });
  });
};
