/*global Mocha, window*/
if (!Function.prototype.bind) {
  Function.prototype.bind = function (obj) {
    'use strict';
    var fn = this;
    return function () {
      return fn.apply(obj, arguments);
    };
  };
}
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (cb, scope) {
    'use strict';
    var i, l = this.length;
    for (i = 0; i < l; i++) {
      cb.call(scope || window, this[i], i);
    }
  };
}
