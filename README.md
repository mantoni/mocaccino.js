# mocaccino [![Build Status](https://secure.travis-ci.org/mantoni/mocaccino.js.png?branch=master)](http://travis-ci.org/mantoni/mocaccino.js)

[Mocha][] test runner as a [Browserify][] plugin.

Repository: <https://github.com/mantoni/mocaccino.js>

---

## Install with npm

```
npm install mocaccino -g
```

## Usage

Mocaccino is a browserify plugin:

```
browserify -p [ mocaccino OPTIONS ]

where OPTIONS are:

  --reporter, -R  Mocha reporter to use, defaults to "tap"
  --yields, -y    Yield every N milliseconds, defaults to 250
  --node          If result is used in node instead of a browser
```

The `yields` option causes a tiny delay every N milliseconds to allow pending
I/O to happen. It's ignored if `--node` is given.

## Headless browser testing

Browserify a test and run in a Phantom.JS with [Phantomic][]:

```
$ browserify -p mocaccino test.js | phantomic --brout
```

### Code coverage with headless browser

Use the [Coverify][] transform and [Phantomic][]:

```
$ browserify -p mocaccino -t coverify test.js | phantomic --brout | coverify
```

### Code coverage with node

Use the [Coverify][] transform and node:

```
$ browserify --bare -p [ mocaccino --node ] -t coverify test.js | node | coverify
```

## License

MIT

[Mocha]: http://visionmedia.github.io/mocha/
[Browserify]: http://browserify.org
[Coverify]: https://github.com/substack/coverify
[Phantomic]: https://github.com/mantoni/phantomic
