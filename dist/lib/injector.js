"use strict";
Object.defineProperties(exports, {
  createInjector: {get: function() {
      return createInjector;
    }},
  __esModule: {value: true}
});
var __moduleName = "injector";
var $__0 = $traceurRuntime.assertObject(require("./angular.js")),
    isString = $__0.isString,
    isArray = $__0.isArray;
var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG = /^\s*(\S+)\s*$/;
function createInjector(modulesToLoad) {
  var cache = {};
  var loadedModules = {};
  var $provide = {
    constant: (function(key, value) {
      if (key === 'hasOwnProperty') {
        throw new Error('hasOwnProperty is not a valid constant name!');
      }
      return cache[key] = value;
    }),
    provider: (function(key, provider) {
      return cache[key] = provider.$get();
    })
  };
  function instantiate(Type, locals) {
    var UnwrappedType = isArray(Type) ? Type[Type.length - 1] : Type;
    var instance = Object.create(UnwrappedType.prototype);
    invoke(Type, instance, locals);
    return instance;
  }
  function annotate(fn) {
    if (isArray(fn)) {
      return fn.slice(0, fn.length - 1);
    } else if (fn.$inject) {
      return fn.$inject;
    } else if (!fn.length) {
      return [];
    } else {
      var argDeclaration = fn.toString().match(FN_ARGS);
      return argDeclaration[1].split(',').map((function(arg) {
        return arg.replace(/\s/g, "");
      }));
    }
  }
  function invoke(fn, context, locals) {
    var args = annotate(fn).map((function(token) {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : cache[token];
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    }));
    if (isArray(fn)) {
      fn = fn[fn.length - 1];
    }
    return fn.apply(context, args);
  }
  modulesToLoad.forEach(function loadModule(moduleName) {
    var module;
    if (!loadedModules.hasOwnProperty(moduleName)) {
      loadedModules[moduleName] = true;
      module = angular.module(moduleName);
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
    invoke: invoke,
    annotate: annotate,
    instantiate: instantiate
  };
}
;
