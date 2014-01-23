#!/usr/bin/env node
/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var mocaccino = require('../lib/mocaccino');

var options = {};
var input   = process.stdin;
var argv    = process.argv.slice(2);

var arg;
while (argv.length) {
  arg = argv.shift();
  if (arg === '--browser' || arg === '-b') {
    options.browser = true;
  } else if (arg === '--reporter' || arg === '-r') {
    options.reporter = argv.shift();
  } else {
    input = arg;
  }
}

mocaccino(input, options).pipe(process.stdout);
