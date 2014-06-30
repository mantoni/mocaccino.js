/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

describe('fixture', function () {

  it('passes', function (done) {
    //default Mocha timeout is 2000 ms, we'll set our timeout to 3500 ms
    setTimeout(function () {
      //console.log('timeout success');
      done();
    }, 3000);
  });

});
