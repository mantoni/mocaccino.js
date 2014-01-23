/*jslint sloppy: true*/
/*global Mocha, _mocha, window*/
Mocha.mocaccinoDone = function () { return; };
if (window.process) {
  Mocha.process.stdout = window.process.stdout;
  if (process.exit) {
    Mocha.mocaccinoDone = function (errs) { process.exit(errs ? 1 : 0); };
  }
}
_mocha.run(Mocha.mocaccinoDone);
