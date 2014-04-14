# Changes

## 0.6.0

- Bump [brout][] and verify [phantomic][] can be used with `--brout`

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
