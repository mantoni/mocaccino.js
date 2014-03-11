/*global Mocha, window*/
/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

require('brout');
require('mocha/mocha');

var _mocha = new Mocha();
_mocha.reporter('{{REPORTER}}');
_mocha.suite.emit('pre-require', window);

setTimeout(function () {
  Mocha.process.stdout = process.stdout;
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
