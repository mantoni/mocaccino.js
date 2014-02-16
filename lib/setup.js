/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

if (!Function.prototype.bind) {
  Function.prototype.bind = function (obj) {
    var fn = this;
    return function () {
      return fn.apply(obj, arguments);
    };
  };
}

require('brout');
var _Mocha = require('mocha');
var Mocha  = global.Mocha || _Mocha;
var _mocha = new Mocha();
_mocha.reporter('{{REPORTER}}');
_mocha.suite.emit('pre-require', global);

setTimeout(function () {
  if (Mocha.process) {
    Mocha.process.stdout = process.stdout;
  }
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
