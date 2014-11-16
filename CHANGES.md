# Changes

## 1.3.0

- Allow to override the window width                                                                  │[mochify.js master]# v

## 1.2.0

- Add support for grep invert option (Daniel Davidson)

## 1.1.0

- Add support for mocha `grep` option (Daniel Davidson)

## 1.0.7

- Set window width and dot symbol for node as well

## 1.0.6

- Bump through2, resolve and phantomic
- Fix coverage for browsers

## 1.0.5

- Fix for calling `b.bundle()` multiple times

## 1.0.4

- Listen to Browserify 'reset' events

## 1.0.3

- Fix brout resolution for Windows

## 1.0.2

- Fix issue with multiple push calls to through2

## 1.0.1

- Fix brout resolving

## 1.0.0

- Require Browserify 5

## 0.8.0

- Added `timeout` and `t` options so one can test async scripts that last longer than `2000ms`

## 0.7.0

- Added `ui` and `U` options so one can select BDD/TDD/QUnit (Mikela Clemmons)

## 0.6.4

- Use `process.nextTick` to yield instead of `setTimeout`

## 0.6.3

- Support `require('mocha')`

## 0.6.2

- Lame cygwin thing with `getWindowSize`

## 0.6.1

- Pass on terminal window width
- Use ascii dot symbol for compatibility

## 0.6.0

- Bump [brout][] and verify [phantomic][] can be used with `--brout`
- Fix path to setup file on windows

## 0.5.0

- Yield every 250 milliseconds by default to allow pending I/O to happen
- Add `--yields` / `-y` option to configure yield interval

## 0.4.2

- Allow to use Mocaccino output in a browser with [coverify][]

## 0.4.1

- Fix `describe.only` and `it.only` (Andrey Popp)

## 0.4.0

- Include Mocha via Browserify (Andrey Popp)
- Remove `Function.prototype.bind` shim since Phantomic 0.5 always includes
  es5-shim (Andrey Popp)

## 0.3.1

Don't screw up [coverify][] output

## 0.3.0

Rewrote Mocaccino as Browserify plugin

## 0.2.1

Resolve Mocha properly

## 0.2.0

Support most Mocha reporters when used with `brout`

- Removed mocaccino-reporter
- Using "tap" as the default reporter because it works with standard
  `console.log` statements
- Adding in browser shims for `Array.forEach` and `Function.bind`
- Using `process.exit(code)` on finish if available

## 0.1.0

Initial release

[coverify]: https://github.com/substack/coverify
[brout]: https://github.com/mantoni/brout.js
[phantomic]: https://github.com/mantoni/phantomic
