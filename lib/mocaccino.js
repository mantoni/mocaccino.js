/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through');
var fs      = require('fs');
var path    = require('path');
var resolve = require('resolve');

function readFile(out, path, cb) {
  var stream = fs.createReadStream(path);
  stream.on('data', function (chunk) {
    out.write(chunk);
  });
  stream.on('end', cb);
}

function createMocha(out, inputStream, options) {
  var globalRef = options.browser ? 'window' : 'global';
  var reporter  = options.reporter || 'tap';
  out.write('var _mocha = new Mocha();\n');
  out.write('_mocha.reporter("' + reporter + '");\n');
  out.write('_mocha.suite.emit("pre-require", ' + globalRef + ');\n');
  inputStream.on('data', function (chunk) {
    out.write(chunk);
  });
  inputStream.on('end', function () {
    var runner = options.browser ? 'browser' : 'node';
    readFile(out, path.resolve(__dirname, 'run-' + runner + '.js'),
      function () {
        out.write(null);
      });
  });
}

function requireMocha(out, inputStream, options) {
  if (options.browser) {
    readFile(out, path.resolve(__dirname, 'setup-browser.js'), function () {
      resolve('mocha', {}, function (err, mochaPath) {
        if (err) {
          console.error(String(err));
          out.write(null);
        } else {
          readFile(out, path.resolve(mochaPath, '..', 'mocha.js'),
            function () {
              createMocha(out, inputStream, options);
            });
        }
      });
    });
  } else {
    out.write('var Mocha = require("mocha");\n');
    createMocha(out, inputStream, options);
  }
}

module.exports = function (input, options) {
  if (typeof input === 'string') {
    input = fs.createReadStream(input);
  }
  var out = through();
  process.nextTick(function () {
    requireMocha(out, input, options);
  });
  return out;
};
