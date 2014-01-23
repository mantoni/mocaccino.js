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
      assert(stdout.indexOf('# fail 0') !== -1);
      assert(stdout.indexOf('# pass 1') !== -1);
      done();
    });
    node.stdin.write(stdout);
    node.stdin.end();
  });
}

function pipeFixture(cmd, name) {
  fs.createReadStream('test/fixture/' + name + '.js').pipe(cmd.stdin);
}

describe('mocaccino', function () {
  this.timeout(5000);

  it('pipes a mocha test to node', function (done) {
    var cmd = fork('bin/cmd.js', 'node', done);
    pipeFixture(cmd, 'pass');
  });

  it('pipes a mocha test for browsers to phantomic', function (done) {
    var cmd = fork('bin/cmd.js --browser', 'phantomic', done);
    pipeFixture(cmd, 'pass');
  });

  it('pipes a mocha test for browsers to phantomic (short)', function (done) {
    var cmd = fork('bin/cmd.js -b', 'phantomic', done);
    pipeFixture(cmd, 'pass');
  });

  it('reads a mocha test and pipes it to node', function (done) {
    fork('bin/cmd.js test/fixture/pass.js', 'node', done);
  });

  it('errs on failing test', function (done) {
    run('bin/cmd.js test/fixture/fail.js', done, function (stdout) {
      var node = exec('node', function (err, stdout) {
        assert(!!err);
        assert(stdout.indexOf('not ok 1 fixture fails') !== -1);
        assert(stdout.indexOf('Error: Ouch!') !== -1);
        assert(stdout.indexOf('# fail 1') !== -1);
        assert(stdout.indexOf('# pass 0') !== -1);
        done();
      });
      node.stdin.write(stdout);
      node.stdin.end();
    });
  });

  it('invokes process.exit in browsers', function (done) {
    var cmd = fork('bin/cmd.js -b', 'phantomic', done);
    pipeFixture(cmd, 'exit');
  });

  it('uses the given reporter in node', function (done) {
    run('bin/cmd.js -r list test/fixture/pass.js', done, function (stdout) {
      var node = exec('node', function (err, stdout) {
        assert(!err);
        assert(stdout.indexOf('fixture passes:') !== -1);
        assert(stdout.indexOf('1 passing') !== -1);
        done();
      });
      node.stdin.write(stdout);
      node.stdin.end();
    });
  });

  it('uses the given reporter in browser', function (done) {
    run('bin/cmd.js -b -r list test/fixture/stdout.js', done,
      function (stdout) {
        var node = exec('phantomic', function (err, stdout) {
          assert(!err);
          assert(stdout.indexOf('fixture passes') !== -1);
          assert(stdout.indexOf('%d passing') !== -1);
          done();
        });
        node.stdin.write(stdout);
        node.stdin.end();
      });
  });

});
