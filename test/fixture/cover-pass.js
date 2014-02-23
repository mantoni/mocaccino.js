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

  function called() {
    return 42;
  }

  function test(a) {
    return a || called();
  }

  it('passes', function () {
    test(false);
  });

});
