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


function run(proc, b, opts, done) {
  var p = spawn(proc);
  var s = b.bundle(opts);
  s.on('error', function (err) {
    done(err);
  });
  var out = '';
  p.stdout.on('data', function (data) {
    out += data;
  });
  p.stderr.pipe(process.stderr);
  p.on('close', function (code) {
    done(null, code, out);
  });
  s.pipe(p.stdin);
}


var bundleOptionsBare = {
  detectGlobal     : true,
  insertGlobalVars : ['__dirname', '__filename']
};

function passOutputAssert(done) {
  return function (err, code, out) {
    if (err) {
      done(err);
    } else {
      assert.equal(code, 0);
      assert.equal(out, '1..1\n'
        + 'ok 1 fixture passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n');
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

    it('passes test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino);
      run('phantomic', b, {}, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('phantomic', b, {}, failOutputAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino);
      run('phantomic', b, {}, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino);
      run('phantomic', b, {}, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'list' });
      run('phantomic', b, {}, function (err, code, out) {
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

  });

  describe('node', function () {

    it('passes test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true });
      run('node', b, bundleOptionsBare, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino, { node : true });
      run('node', b, bundleOptionsBare, failOutputAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', b, bundleOptionsBare, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', b, bundleOptionsBare, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, reporter : 'list' });
      run('node', b, bundleOptionsBare, function (err, code, out) {
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
  });

});
