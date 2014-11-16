/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global describe, it*/
'use strict';

var assert = require('assert');
var mocha = require('mocha');

describe('fixture', function () {

  it('window-width', function () {
    assert.equal(mocha.reporters.Base.window.width, 123);
  });

});
