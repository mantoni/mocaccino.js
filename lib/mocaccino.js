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

function createMocha(out, inputStream, options) {
  var globalRef = options.browser ? 'window' : 'global';
  out.write('var _mocha = new Mocha();\n');
  out.write('_mocha.reporter(MocaccinoReporter);\n');
  out.write('_mocha.suite.emit("pre-require", ' + globalRef + ');\n');
  inputStream.on('data', function (chunk) {
    out.write(chunk);
  });
  inputStream.on('end', function () {
    out.write('\n_mocha.run(function (errs) {\n');
    out.write('  setTimeout(function () {\n');
    out.write('    if (errs) { process.exit(1); }\n');
    out.write('  }, 1);\n});');
  });
}

function readFile(out, path, cb) {
  var stream = fs.createReadStream(path);
  stream.on('data', function (chunk) {
    out.write(chunk);
  });
  stream.on('end', cb);
}


function requireReporter(out, inputStream, options) {
  readFile(out, __dirname + '/mocaccino-reporter.js', function () {
    createMocha(out, inputStream, options);
  });
}

function requireMocha(out, inputStream, options) {
  if (options.browser) {
    readFile(out, 'node_modules/mocha/mocha.js', function () {
      requireReporter(out, inputStream, options);
    });
  } else {
    out.write('var Mocha = require("mocha");\n');
    requireReporter(out, inputStream, options);
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
