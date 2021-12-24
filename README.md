# mocaccino

[![Node.js CI](https://github.com/mantoni/mocaccino.js/actions/workflows/test.yml/badge.svg)](https://github.com/mantoni/mocaccino.js/actions/workflows/test.yml)
[![SemVer]](https://semver.org)
[![License]](https://github.com/mantoni/mocaccino.js/blob/master/LICENSE)

[Mocha][] test runner as a [Browserify][] plugin.

## Install

```
npm install mocaccino --save-dev
```

## Real browser testing

This module is developed as part of [Mochify][] which allows you to run tests
with a headless browser, on a Selenium grid, in the cloud with SauceLabs or
generates a standalone HTML page to run the tests. The underlying modules can
also be used as Browserify plugins.

- [min-webdriver][] for Selenium and SauceLabs support
- [Consolify][] to generate a standalone HTML page

### Code coverage with node

Use the [Coverify][] transform and node:

```
$ browserify --bare -p [ mocaccino --node ] -t coverify test.js | node | coverify
```

## Usage

Mocaccino is a browserify plugin:

```
browserify -p [ mocaccino OPTIONS ]

where OPTIONS are:

  --reporter, -R  Mocha reporter to use, defaults to "tap"
  --grep          Mocha grep option
  --fgrep         Mocha fgrep option
  --invert        Mocha invert option
  --timeout, -t   Mocha timeout in milliseconds to use, defaults to 2000
  --ui, -U        Mocha user interface to use, defaults to "bdd"
  --yields, -y    Yield every N milliseconds, defaults to 250
  --node          If result is used in node instead of a browser
  --windowWidth   Overrides the window width, defaults to the current shells
                  window width or fall back to 80
  --no-colors     Disable colors (overrides color support detection)
  --colors        Enable colors (overrides color support detection)
  --mochaPath     Path to custom Mocha module
```

The `yields` option causes a tiny delay every N milliseconds to allow pending
I/O to happen. It's ignored if `--node` is given.

## Compatibility

- Node 12 or later
- Browserify 5.9 or later (since version 1.0.0)
- Browserify 4.x (before 1.0.0)

## License

MIT

[Build Status]: http://img.shields.io/travis/mantoni/mocaccino.js.svg
[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/mocaccino.svg
[Mocha]: http://mochajs.org/
[Browserify]: http://browserify.org
[Mochify]: https://github.com/mantoni/mochify.js
[min-webdriver]: https://github.com/mantoni/min-webdriver
[Consolify]: https://github.com/mantoni/consolify
[Coverify]: https://github.com/substack/coverify
