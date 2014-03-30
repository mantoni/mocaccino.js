/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

describe('cover', function () {

  function notCalled() {
    return 42;
  }

  function test(a) {
    return a || notCalled();
  }

  it('yields', function (done) {
    setTimeout(done, 50);
  });

  it('fails', function () {
    test(true);
  });

});
