/*global Mocha, window*/
/*
 * mocaccino.js
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

Mocha.reporters.Base.window.width = JSON.parse('{{WINDOW_WIDTH}}');
Mocha.reporters.Base.symbols.dot = '.';
var grep = '{{GREP}}';
var fgrep = '{{FGREP}}';
var mocha = new Mocha({
  grep: grep.length ? grep : undefined,
  fgrep: fgrep.length ? fgrep : undefined
});
if ('{{INVERT}}' === true) { // eslint-disable-line no-constant-condition
  mocha.invert();
}

if (Mocha.reporters['{{REPORTER}}']) {
  mocha.reporter('{{REPORTER}}', '{{REPORTER_OPTIONS}}');
} else {
  mocha.reporter(require('{{REPORTER}}'), '{{REPORTER_OPTIONS}}');
}

mocha.ui('{{UI}}');
mocha.timeout('{{TIMEOUT}}');
mocha.color('{{USE_COLORS}}');
mocha.suite.emit('pre-require', window, '', mocha);
var t = new Date().getTime();
var y = Number('{{YIELDS}}');
mocha.suite.afterEach(function (done) {
  var now = new Date().getTime();
  if (now - t > y) {
    t = now;
    if (process.nextTick) {
      process.nextTick(done);
    } else {
      setTimeout(done, 0);
    }
  } else {
    done();
  }
});

setTimeout(function () {
  Mocha.process.stdout = process.stdout;
  mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
