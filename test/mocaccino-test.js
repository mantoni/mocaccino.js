/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

var assert = require('assert');
var exec   = require('child_process').exec;
var fs     = require('fs');

var mocaccino = require('../lib/mocaccino');

function run(cmd, done, cb) {
  return exec(cmd, function (err, stdout) {
    if (err) {
      done(err);
    } else {
      cb(stdout);
    }
  });
}

function fork(cmd, pipeThrough, done) {
  return run(cmd, done, function (stdout) {
    var node = run(pipeThrough, done, function (stdout) {
      assert(stdout.indexOf('fixture') !== -1);
      assert(stdout.indexOf('Mocaccino FTW!') !== -1);
      assert(stdout.indexOf('0 fail | 1 pass |') !== -1);
      done();
    });
    node.stdin.write(stdout);
    node.stdin.end();
  });
}

function pipeFixture(cmd) {
  fs.createReadStream('test/fixture/pass.js').pipe(cmd.stdin);
}

describe('mocaccino', function () {
  this.timeout(5000);

  it('pipes a mocha test to node', function (done) {
    var cmd = fork('bin/cmd.js', 'node', done);
    pipeFixture(cmd);
  });

  it('pipes a mocha test for browsers to phantomic', function (done) {
    var cmd = fork('bin/cmd.js --browser', 'phantomic', done);
    pipeFixture(cmd);
  });

  it('pipes a mocha test for browsers to phantomic (short)', function (done) {
    var cmd = fork('bin/cmd.js -b', 'phantomic', done);
    pipeFixture(cmd);
  });

  it('reads a mocha test and pipes it to node', function (done) {
    fork('bin/cmd.js test/fixture/pass.js', 'node', done);
  });

  it('errs on failing test', function (done) {
    run('bin/cmd.js test/fixture/fail.js', done, function (stdout) {
      var node = exec('node', function (err, stdout, stderr) {
        assert(!!err);
        assert(stderr.indexOf('Failed: fails') !== -1);
        assert(stderr.indexOf('Error: Ouch!') !== -1);
        assert(stdout.indexOf('1 fail | 0 pass |') !== -1);
        done();
      });
      node.stdin.write(stdout);
      node.stdin.end();
    });
  });

});
