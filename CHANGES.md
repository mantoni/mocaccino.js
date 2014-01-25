# Changes

## 0.2.0

Support most Mocha reporters when used with `brout`

- Removed mocaccino-reporter
- Using "tap" as the default reporter because it works with standard
  `console.log` statements
- Adding in browser shims for `Array.forEach` and `Function.bind`
- Using `process.exit(code)` on finish if available

## 0.1.0

Initial release
