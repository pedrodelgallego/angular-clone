"use strict";
Object.defineProperties(exports, {
  createInjector: {get: function() {
      return createInjector;
    }},
  __esModule: {value: true}
});
var __moduleName = "injector";
var isString = $traceurRuntime.assertObject(require("./angular.js")).isString;
function createInjector(modulesToLoad) {
  var cache = {};
  var loadedModules = {};
  var $provide = {constant: (function(key, value) {
      if (key === 'hasOwnProperty') {
        throw new Error('hasOwnProperty is not a valid constant name!');
      }
      return cache[key] = value;
    })};
  function invoke(fn, context, locals) {
    var args = fn.$inject.map((function(token) {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : cache[token];
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    }));
    return fn.apply(context, args);
  }
  modulesToLoad.forEach(function loadModule(moduleName) {
    var module;
    if (!loadedModules.hasOwnProperty(moduleName)) {
      loadedModules[moduleName] = true;
      module = window.angular.module(moduleName);
      loadedModules[moduleName] = module;
      module.requires.forEach(loadModule);
      module._invokeQueue.forEach((function(invokeArgs) {
        var $__0 = $traceurRuntime.assertObject(invokeArgs),
            method = $__0[0],
            args = $__0[1];
        $provide[method].apply($provide, args);
      }));
    }
  });
  return {
    has: (function(name) {
      return cache.hasOwnProperty(name);
    }),
    get: (function(name) {
      return cache[name];
    }),
    invoke: invoke
  };
}
;
