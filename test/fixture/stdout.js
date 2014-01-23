/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals window, describe, it*/
'use strict';

window.process = {
  stdout: {
    write: function (out) {
      console.log(out);
    }
  }
};

describe('fixture', function () {

  it('passes', function () {
    console.log('Mocaccino FTW!');
  });

});
