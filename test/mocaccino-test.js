/*
 * mocaccino.js
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*globals describe, it, Promise*/
'use strict';

var assert     = require('assert');
var browserify = require('browserify');
var coverify   = require('coverify');
var listen     = require('listen');
var spawn      = require('child_process').spawn;
var mocaccino  = require('../lib/mocaccino');
var path       = require('path');
var puppeteer  = require('puppeteer');

function broutHandler() {
  if (typeof process === 'undefined') {
    console.log('[EXIT 1]');
    return;
  }
  var log = console.log.original;
  process._brout.on('exit', function (code) {
    log.call(console, '[EXIT ' + (code || 0) + ']');
  });
}

function run(proc, args, b, done) {
  if (proc === 'node') {
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
  } else if (proc === 'chromium') {
    b.bundle(function (err, result) {
      var page = null;
      var browser = null;
      if (err) {
        done(err, 1);
        return;
      }
      puppeteer.launch()
        .then(function (_browser) {
          browser = _browser;
          return browser.newPage();
        })
        .then(function (_page) {
          page = _page;
          return page.goto(
            'file:' + path.dirname(__dirname) + '/test/fixture/index.html'
          );
        })
        .then(function () {
          return new Promise(function (resolve, reject) {
            var buf = '';

            page.on('console', function (msg) {
              if (msg.type() !== 'log') {
                return;
              }

              var text = msg.text();
              if (text.indexOf('[EXIT ') === 0) {
                var code = text.substring(6, text.length - 1);
                resolve({ out: buf, code: parseInt(code, 10) });
                return;
              }
              buf += text + '\n';
            });

            page.on('pageerror', reject);
            page.on('error', reject);

            Promise.all([
              page.evaluate(result.toString()),
              page.evaluate(broutHandler)
            ])
              .catch(reject);
          });
        })
        .then(function (result) {
          done(null, result.code, result.out);
        })
        .catch(function (err) {
          done(err, 1);
        })
        .then(function () {
          browser.close();
        });
    });
  } else {
    done(new Error('Cannot run tests for ' + proc));
  }
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
      assert.equal(out, 'ok 1 fixture passes\n'
        + '# tests 1\n'
        + '# pass 1\n'
        + '# fail 0\n'
        + '1..1\n');
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
      assert.equal(out.indexOf('not ok 1 fixture fails\n'), 0);
      assert(out.indexOf('# tests 1\n# pass 0\n# fail 1\n1..1') > 1);
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
    var expected = 'ok %num fixture passes flag\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n'
      + '1..%num\n';

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
    var expected = 'ok 1 fixture passes flag\n'
      + 'ok 2 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n'
      + '1..%num\n';

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
    var expected = 'ok 1 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n'
      + '1..%num\n';

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
    var expected = 'ok 1 fixture passes (.*)\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n'
      + '1..%num\n';

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
    var expected = 'ok 1 fixture passes without flag\n'
      + 'ok %num fixture passes with regex grep\n'
      + '# tests %num\n'
      + '# pass %num\n'
      + '# fail 0\n'
      + '1..%num\n';

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

  describe('browser', function () {
    this.timeout(10000);

    it('passes test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino);
      run('chromium', [], b, passOutputAssert(done));
    });

    it('fails test', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fail');
      b.plugin(mocaccino);
      run('chromium', [], b, failOutputAssert(done));
    });

    it('filters tests when grep is set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag' });
      run('chromium', [], b, flaggedGrepAssert(done));
    });

    it('does not filter tests when grep is not set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino);
      run('chromium', [], b, unFlaggedGrepAssert(done));
    });

    it('treats string grep as a regular expression', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: 'with(out)?' });
      run('chromium', [], b, regexGrepAssert(done));
    });

    it('treats RegExp grep as a regular expression', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: /with(out)?/ });
      run('chromium', [], b, regexGrepAssert(done));
    });

    it('treats fgrep as an ordinary string', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-fgrep');
      b.plugin(mocaccino, { fgrep: 'passes (.*)' });
      run('chromium', [], b, regexFgrepAssert(done));
    });

    it('inverts filter when invert is set', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-grep');
      b.plugin(mocaccino, { grep: '#flag', invert: true });
      run('chromium', [], b, invertedFlaggedGrepAssert(done));
    });

    it('passes coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-pass');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('chromium', [], b, coverage(function (code) {
        assert.equal(code, 0);
        done();
      }));
    });

    it('fails coverage', function (done) {
      var b = browserify();
      b.add('./test/fixture/cover-fail');
      b.transform(coverify);
      b.plugin(mocaccino, { yields : 25 });
      run('chromium', [], b, coverage(function (code) {
        assert.notEqual(code, 0);
        done();
      }));
    });

    it('uses reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'list' });
      run('chromium', [], b, function (err, code, out) {
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
      run('chromium', [], b, function (err, code, out) {
        /*jslint regexp: true*/
        assert(!out);
        assert.equal(code, 1);
        assert(/file output not supported in browser/.test(err.message));
        done();
      });
    });

    it('uses custom reporter', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { reporter : 'mocha-jenkins-reporter' });
      run('chromium', [], b, function (err, code, out) {
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
      run('chromium', [], b, passOutputAssert(done));
    });

    it('uses ui "tdd"', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-ui-tdd');
      b.plugin(mocaccino, { ui : 'tdd' });
      run('chromium', [], b, passOutputAssert(done));
    });

    it('only', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-only');
      b.plugin(mocaccino);
      run('chromium', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('requires mocha', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-require-mocha');
      b.plugin(mocaccino);
      run('chromium', [], b, passOutputAssert(done));
    });

    it('uses timeout', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-timeout');
      b.plugin(mocaccino, { timeout : 100 });
      run('chromium', ['--brout'], b, function (err, code) {
        assert.equal(code, 1);
        done(err);
      });
    });

    it('uses windowWidth', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-window-width');
      b.plugin(mocaccino, { windowWidth : 123 });
      run('chromium', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('disables colors', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { colors : false, reporter : 'dot' });
      run('chromium', [], b, function (err, code, out) {
        assert.equal(code, 0);
        assert.equal(out.trim().split('\n')[0], '.');
        done(err);
      });
    });

    it('enables colors', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { colors : true, reporter : 'dot' });
      run('chromium', [], b, function (err, code) {
        assert.equal(code, 0);
        done(err);
      });
    });

    it('uses custom relative path to mocha module', function (done) {
      var b = browserify();
      b.add('./test/fixture/test-pass');
      b.plugin(mocaccino, { mochaPath : './node_modules/mocha' });
      run('chromium', [], b, function (err, code) {
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
      run('chromium', [], b, function (err, code) {
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
      b.plugin(mocaccino, { node : true, colors : true, reporter : 'dot' });
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
