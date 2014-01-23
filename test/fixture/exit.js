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
  exit: function () {
    console.log('Mocaccino FTW!');
  }
};

describe('fixture', function () {

  it('passes', function () {
    return;
  });

});
