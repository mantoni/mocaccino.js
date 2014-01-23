# mocaccino [![Build Status](https://secure.travis-ci.org/mantoni/mocaccino.js.png?branch=master)](http://travis-ci.org/mantoni/mocaccino.js)

Make [Mocha][] play nicely with [Browserify][].

Repository: <https://github.com/mantoni/mocaccino.js>

---

## Install with npm

```
npm install mocaccino -g
```

## Usage

If you chose a local install (without the `-g`), you find the mocaccino
executable in `node_modules/.bin/mocaccino`.

Mocaccino takes a script and wraps it with a Mocha test runner.

### Headless browser testing

Browserify a test and run in a headless browser (requires [Phantomic][]):

```
$ browserify test.js | mocaccino --browser | phantomic
```

Passing `--browser` (`-b`) includes `node_modules/mocha/mocha.js` in
the script.

### Mocha reporters

By default, the "tap" reporter is used. To use other reporters like "list" or
"spec", you will need [brout][] and then configure the the reporter with
`--reporter` (`-r`):

```
$ browserify ./node_modules/brout test.js | mocaccino -b --reporter list | phantomic
```

### Code coverage with headless browser

Assert code coverage with [Coverify][] and when running through [Phantomic][]:

```
$ browserify --bare -t coverify test.js | mocaccino -b | phantomic | coverify
```

### Code coverage with node

Assert code coverage with [Coverify][]:

```
$ browserify --bare -t coverify test.js | mocaccino | node | coverify
```

## API

Wrap a file:

```js
var mocaccino = require('mocaccino');

var outputStream = mocaccino('some/script.js');
```

Wrap a stream:

```js
var outputStream = mocaccino(process.stdin);
```

Options:

```js
var outputStream = mocaccino(process.stdin, {
  browser : true
});
```

## License

MIT

[Mocha]: http://visionmedia.github.io/mocha/
[Browserify]: http://browserify.org
[Coverify]: https://github.com/substack/coverify
[Phantomic]: https://github.com/mantoni/phantomic
[brout]: https://github.com/mantoni/brout.js
