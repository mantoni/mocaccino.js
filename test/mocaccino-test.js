/*
 * mocaccino.js
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it*/
'use strict';

var assert     = require('assert');
var browserify = require('browserify');
var coverify   = require('coverify');
var listen     = require('listen');
var spawn      = require('child_process').spawn;
var mocaccino  = require('../lib/mocaccino');
var path       = require('path');

function run(proc, args, b, done) {
  var l = listen();
  var p = spawn(proc, args);
  var s = b.bundle();
  s.on('error', function (err) {
    done(err);
  });
  var out = '';
  p.stdout.on('data', function (data) {
    out += data;
  });
  p.stdout.on('end', l());
  p.stderr.pipe(process.stderr);
  var onClose = l('code');
  p.on('close', function (code) {
    onClose(null, code);
  });
  l.then(function (err, res) {
    if (err) {
      done(err);
    } else {
      done(null, res.code, out);
    }
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
      var cov = spawn('node_modules/.bin/coverify');
      //cov.stderr.pipe(process.stderr);
      cov.stdin.write(out);
      cov.stdin.end();
      cov.on('exit', callback);
    }
  };
}

var NUM_TESTS_RE = /%num/g;

function flaggedGrepAssert(done) {
  return function (err, code, out) {
    var expected = '1..%num\n'
      + 'ok %num fixture passes flag\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n';

    if (err) {
      done(err);
    } else {
      assert.equal(out, expected.replace(NUM_TESTS_RE, '1'));
      assert.equal(code, 0);
      done();
    }
  };
}

function unFlaggedGrepAssert(done) {
  return function (err, code, out) {
    var expected = '1..%num\n'
      + 'ok 1 fixture passes flag\n'
      + 'ok 2 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n';

    if (err) {
      done(err);
    } else {
      assert.equal(out, expected.replace(NUM_TESTS_RE, '3'));
      assert.equal(code, 0);
      done();
    }
  };
}

function regexGrepAssert(done) {
  return function (err, code, out) {
    var expected = '1..%num\n'
      + 'ok 1 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n';

    if (err) {
      done(err);
    } else {
      assert.equal(out, expected.replace(NUM_TESTS_RE, '2'));
      assert.equal(code, 0);
      done();
    }
  };
}

function regexFgrepAssert(done) {
  return function (err, code, out) {
    var expected = '1..%num\n'
      + 'ok 1 fixture passes (.*)\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n';

    if (err) {
      done(err);
    } else {
      assert.equal(out, expected.replace(NUM_TESTS_RE, '1'));
      assert.equal(code, 0);
      done();
    }
  };
}

function invertedFlaggedGrepAssert(done) {
  return function (err, code, out) {
    var expected = '1..%num\n'
      + 'ok 1 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n';

    if (err) {
      done(err);
    } else {
      assert.equal(out, expected.replace(NUM_TESTS_RE, '2'));
      assert.equal(code, 0);
      done();
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
      run('phantomic', [], b, passOutputAssert(done));
    });

    it('passes --brout test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino);
      run('phantomic', ['--brout'], b, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('phantomic', [], b, failOutputAssert(done));
    });

    it('fails --brout test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('phantomic', ['--brout'], b, failOutputAssert(done));
    });

    it('filters tests when grep is set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag' });
      run('phantomic', [], b, flaggedGrepAssert(done));
    });

    it('does not filter tests when grep is not set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino);
      run('phantomic', [], b, unFlaggedGrepAssert(done));
    });

    it('treats string grep as a regular expression', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: 'with(out)?' });
      run('phantomic', [], b, regexGrepAssert(done));
    });

    it('treats RegExp grep as a regular expression', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: /with(out)?/ });
      run('phantomic', [], b, regexGrepAssert(done));
    });

    it('treats fgrep as an ordinary string', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fgrep');
      b.plugin(mocaccino, { fgrep: 'passes (.*)' });
      run('phantomic', [], b, regexFgrepAssert(done));
    });

    it('inverts filter when invert is set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag', invert: true });
      run('phantomic', [], b, invertedFlaggedGrepAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('phantomic', [], b, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('phantomic', [], b, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'list' });
      run('phantomic', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses reporter options', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, {
        reporter : 'xunit',
        reporterOptions: { output: 'report.xml' }
      });
      run('phantomic', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          // We expect an error code since XUnit reporter
          // does not support file output in browser
          assert.equal(code, 1);
          assert(/file output not supported in browser/.test(out), out);
          done();
        }
      });
    });

    it('uses custom reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'mocha-jenkins-reporter' });
      run('phantomic', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses ui "bdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { ui : 'bdd' });
      run('phantomic', [], b, passOutputAssert(done));
    });

    it('uses ui "tdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-ui-tdd');
      b.plugin(mocaccino, { ui : 'tdd' });
      run('phantomic', [], b, passOutputAssert(done));
    });

    it('only', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-only');
      b.plugin(mocaccino);
      run('phantomic', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('requires mocha', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-require-mocha');
      b.plugin(mocaccino);
      run('phantomic', [], b, passOutputAssert(done));
    });

    it('uses timeout', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-timeout');
      b.plugin(mocaccino, { timeout : 100 });
      run('phantomic', ['--brout'], b, function (err, code) {
        assert.equal(code, 1);
        done(err);
      });
    });

    it('uses windowWidth', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-window-width');
      b.plugin(mocaccino, { windowWidth : 123 });
      run('phantomic', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('disables colors', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { colors : false, reporter : 'dot' });
      run('phantomic', [], b, function (err, code, out) {
        assert.equal(code, 0);
        assert.equal(out.trim().split('\n')[0], '.');
        done(err);
      });
    });

    it('enables colors', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { colors : true, reporter : 'dot' });
      run('phantomic', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('uses custom relative path to mocha module', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { mochaPath : './node_modules/mocha' });
      run('phantomic', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('uses custom absolute path to mocha module', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, {
        mochaPath : path.join(process.cwd(), 'node_modules', 'mocha')
      });
      run('phantomic', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });
  });

  describe('node', function () {

    it('passes test', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, failOutputAssert(done));
    });

    it('filters tests when grep is set', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag', node: true });
      run('node', [], b, flaggedGrepAssert(done));
    });

    it('does not filter tests when grep is not set', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { node: true });
      run('node', [], b, unFlaggedGrepAssert(done));
    });

    it('treats string grep as a regular expression', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: 'with(out)?', node: true });
      run('node', [], b, regexGrepAssert(done));
    });

    it('treats RegExp grep as a regular expression', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: /with(out)?/, node: true });
      run('node', [], b, regexGrepAssert(done));
    });

    it('treats fgrep as an ordinary string', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-fgrep');
      b.plugin(mocaccino, { fgrep: 'passes (.*)', node: true });
      run('node', [], b, regexFgrepAssert(done));
    });

    it('inverts filter when invert is set', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag', invert: true, node: true });
      run('node', [], b, invertedFlaggedGrepAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', [], b, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { node : true });
      run('node', [], b, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, reporter : 'list' });
      run('node', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses custom reporter', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, {
        node : true,
        reporter : 'mocha-jenkins-reporter'
      });
      run('node', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        if (err) {
          done(err);
        } else {
          assert.equal(code, 0);
          assert(/passes:.*[0-9]+ms/.test(out), out);
          done();
        }
      });
    });

    it('uses ui "bdd"', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, ui : 'bdd' });
      run('node', [], b, passOutputAssert(done));
    });

    it('uses ui "tdd"', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-ui-tdd');
      b.plugin(mocaccino, { node : true, ui : 'tdd' });
      run('node', [], b, passOutputAssert(done));
    });

    it('only', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-only');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('requires mocha', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-require-mocha');
      b.plugin(mocaccino, { node : true });
      run('node', [], b, passOutputAssert(done));
    });

    it('uses timeout', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-timeout');
      b.plugin(mocaccino, { node : true, timeout : 100 });
      run('node', [], b, function (err, code) {
        assert.equal(code, 1);
        done(err);
      });
    });

    it('uses windowWidth', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-window-width');
      b.plugin(mocaccino, { node : true, windowWidth : 123 });
      run('node', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('disables colors', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, colors : false, reporter : 'dot' });
      run('node', [], b, function (err, code, out) {
        assert.equal(code, 0);
        assert.equal(out.trim().split('\n')[0], '.');
        done(err);
      });
    });

    it('enables colors', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { node : true, color : true, reporter : 'dot' });
      run('node', [], b, function (err, code, out) {
        assert.equal(code, 0);
        assert.equal(out.trim().split('\n')[0], '\u001b[90m.\u001b[0m');
        done(err);
      });
    });

    it('uses custom relative path to mocha module', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, {
        node: true,
        mochaPath : './node_modules/mocha'
      });
      run('node', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('uses custom absolute path to mocha module', function (done) {
      var b = browserify(bundleOptionsBare);
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, {
        node: true,
        mochaPath : path.join(process.cwd(), 'node_modules', 'mocha')
      });
      run('node', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });
  });

});
