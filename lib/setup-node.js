/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var Mocha = require('mocha');
Mocha.reporters.Base.window.width = JSON.parse('{{WINDOW_WIDTH}}');
Mocha.reporters.Base.symbols.dot = '.';
var _mocha = new Mocha();
_mocha.ui('{{UI}}');
_mocha.grep('{{GREP}}');
if ('{{INVERT}}' === true) {
  _mocha.invert();
}
_mocha.reporter('{{REPORTER}}');
_mocha.timeout('{{TIMEOUT}}');
_mocha.suite.emit('pre-require', global, '', _mocha);

setTimeout(function () {
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
