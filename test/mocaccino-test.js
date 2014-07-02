/*
 * mocaccino.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

var assert     = require('assert');
var browserify = require('browserify');
var coverify   = require('coverify');
var spawn      = require('child_process').spawn;
var mocaccino  = require('../lib/mocaccino');


function run(proc, args, b, opts, done) {
  var p = spawn(proc, args);
  var s = b.bundle(opts);
  s.on('error', function (err) {
    done(err);
  });
  var out = '';
  p.stdout.on('data', function (data) {
    out += data;
  });
  p.stderr.pipe(process.stderr);
  p.on('exit', function (code) {
    done(null, code, out);
  });
  s.pipe(p.stdin);
}


var bundleOptionsBare = {
  detectGlobals    : false,
  insertGlobalVars : ['__dirname', '__filename']
};

function passOutputAssert(done) {
  return function (err, code, out) {
    if (err) {
      done(err);
    } else {
      assert.equal(out, '1..1\n'
        + 'ok 1 fixture passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
      assert.equal(code, 0);
      done();
    }
  };
}

function failOutputAssert(done) {
  return function (err, code, out) {
    if (err) {
      done(err);
    } else {
      assert.equal(code, 1);
      assert.equal(out.substring(0, 28), '1..1\nnot ok 1 fixture fails\n');
      assert(out.indexOf('# tests 1\n# pass 0\n# fail 1') > 1);
      done();
    }
  };
}

function coverage(callback) {
  return function (err, code, out) {
    if (err) {
      callback(err);
    } else {
      assert.equal(code, 0);
      var cov = spawn('coverify');
      //cov.stderr.pipe(process.stderr);
      cov.stdin.write(out);
      cov.stdin.end();
      cov.on('exit', callback);
    }
  };
}


describe('plugin', function () {

  describe('phantomjs', function () {
    this.timeout(10000);

    it('passes test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino);
      run('phantomic', [], b, {}, passOutputAssert(done));
    });

    it('passes --brout test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino);
      run('phantomic', ['--brout'], b, {}, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('phantomic', [], b, {}, failOutputAssert(done));
    });

    it('fails --brout test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('phantomic', ['--brout'], b, {}, failOutputAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('phantomic', [], b, {}, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('phantomic', [], b, {}, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'list' });
      run('phantomic', [], b, {}, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes\:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses ui "bdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { ui : 'bdd' });
      run('phantomic', [], b, {}, passOutputAssert(done));
    });

    it('uses ui "tdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-ui-tdd');
      b.plugin(mocaccino, { ui : 'tdd' });
      run('phantomic', [], b, {}, passOutputAssert(done));
    });

    it('only', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-only');
      b.plugin(mocaccino);
      run('phantomic', [], b, {}, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('requires mocha', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-require-mocha');
      b.plugin(mocaccino);
      run('phantomic', [], b, {}, passOutputAssert(done));
    });

    it('uses timeout', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-timeout');
      b.plugin(mocaccino, { timeout : 4000 });
      run('phantomic', ['--brout'], b, {}, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

  });

  describe('node', function () {

    it('passes test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, failOutputAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, reporter : 'list' });
      run('node', [], b, bundleOptionsBare, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes\:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses ui "bdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, ui : 'bdd' });
      run('node', [], b, bundleOptionsBare, passOutputAssert(done));
    });

    it('uses ui "tdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-ui-tdd');
      b.plugin(mocaccino, { node : true, ui : 'tdd' });
      run('node', [], b, bundleOptionsBare, passOutputAssert(done));
    });

    it('only', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-only');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('requires mocha', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-require-mocha');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, bundleOptionsBare, passOutputAssert(done));
    });

    it('uses timeout', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-timeout');
      b.plugin(mocaccino, { node : true, timeout : 4000 });
      run('node', [], b, bundleOptionsBare, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

  });

});
