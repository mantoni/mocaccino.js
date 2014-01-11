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
var argv    = process.argv.slice(2);

if (argv[0] === '--browser' || argv[0] === '-b') {
  options.browser = true;
  argv.shift();
}
var input = process.stdin;
if (argv.length) {
  input = argv[0];
}

mocaccino(input, options).pipe(process.stdout);
