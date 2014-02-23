/*global Mocha, window*/
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
  (function () { return; }.bind({})());
}

require('brout');

var _mocha = new Mocha();
_mocha.reporter('{{REPORTER}}');
_mocha.suite.emit('pre-require', window);

setTimeout(function () {
  Mocha.process.stdout = process.stdout;
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
