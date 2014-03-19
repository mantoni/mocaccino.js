/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var Mocha = require('mocha');
var _mocha = new Mocha();
_mocha.reporter('{{REPORTER}}');
_mocha.suite.emit('pre-require', global, '', _mocha);

setTimeout(function () {
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
