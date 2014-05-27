"use strict";
Object.defineProperties(exports, {
  createInjector: {get: function() {
      return createInjector;
    }},
  __esModule: {value: true}
});
var __moduleName = "injector";
function createInjector(modulesToLoad) {
  var cache = {};
  var $provide = {constant: (function(key, value) {
      return cache[key] = value;
    })};
  modulesToLoad.forEach((function(moduleName) {
    var module = window.angular.module(moduleName);
    module._invokeQueue.forEach((function(invokeArgs) {
      var $__0 = $traceurRuntime.assertObject(invokeArgs),
          method = $__0[0],
          args = $__0[1];
      $provide[method].apply($provide, args);
    }));
  }));
  return {has: (function(name) {
      return cache.hasOwnProperty(name);
    })};
}
;
