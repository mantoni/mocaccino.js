/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

function MocaccinoReporter(runner) {
  var pass = 0;
  var fail = 0;
  var start;

  runner.on('start', function () {
    start = new Date().getTime();
  });
  runner.on('suite', function (suite) {
    if (suite.title) {
      console.log('Running: ' + suite.title);
    }
  });
  runner.on('pass', function () {
    pass++;
  });
  runner.on('fail', function (test, err) {
    console.error('Failed: ' + test.title + '\n\n    ' + String(err) + '\n\n');
    fail++;
  });
  runner.on('end', function () {
    var ms = new Date().getTime() - start;
    console.info('\n' + fail + ' fail | ' + pass + ' pass | ' + ms + ' ms');
  });
}
