"use strict";
Object.defineProperties(exports, {
  Injector: {get: function() {
      return Injector;
    }},
  __esModule: {value: true}
});
var __moduleName = "injector";
var $__2 = $traceurRuntime.assertObject(require("./angular.js")),
    isString = $__2.isString,
    isArray = $__2.isArray,
    isFunction = $__2.isFunction;
var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG = /^\s*(\S+)\s*$/;
function assertHasOwnPropertyName(key) {
  if (key === 'hasOwnProperty') {
    throw new Error('hasOwnProperty is not a valid constant name!');
  }
  ;
}
function INSTANTIATING() {}
;
var Injector = function Injector(modulesToLoad) {
  var $__0 = this;
  this.providerCache = {};
  this.instanceCache = {};
  this.loadedModules = {};
  this.path = [];
  this.$provide = {
    constant: (function(key, value) {
      assertHasOwnPropertyName(key);
      return $__0.instanceCache[key] = value;
    }),
    provider: (function(key, provider) {
      if (isFunction(provider)) {
        provider = $__0.instantiate(provider);
      }
      return $__0.providerCache[key + "Provider"] = provider;
    })
  };
  var loadModule = (function(moduleName) {
    var module;
    if (!$__0.loadedModules.hasOwnProperty(moduleName)) {
      $__0.loadedModules[moduleName] = true;
      module = angular.module(moduleName);
      $__0.loadedModules[moduleName] = module;
      module.requires.forEach(loadModule);
      module._invokeQueue.forEach((function(invokeArgs) {
        var $__2 = $traceurRuntime.assertObject(invokeArgs),
            method = $__2[0],
            args = $__2[1];
        $__0.$provide[method].apply($__0.$provide, args);
      }));
    }
  });
  modulesToLoad.forEach(loadModule);
};
($traceurRuntime.createClass)(Injector, {
  getService: function(name) {
    if (this.instanceCache.hasOwnProperty(name)) {
      if (this.instanceCache[name] === INSTANTIATING) {
        throw new Error('Circular dependency found: ' + this.path.join(' <- '));
      }
      return this.instanceCache[name];
    } else if (this.providerCache.hasOwnProperty(name)) {
      return this.providerCache[name];
    } else if (this.providerCache.hasOwnProperty(name + "Provider")) {
      this.path.unshift(name);
      var provider = this.providerCache[name + 'Provider'];
      try {
        this.instanceCache[name] = INSTANTIATING;
        this.instanceCache[name] = this.invoke(provider.$get);
      } finally {
        this.path.shift();
        if (this.instanceCache[name] === INSTANTIATING) {
          delete this.instanceCache[name];
        }
      }
      return this.instanceCache[name];
    }
  },
  has: function(name) {
    return this.instanceCache.hasOwnProperty(name) || this.providerCache.hasOwnProperty(name + 'Provider');
  },
  get: function(name) {
    return this.getService(name);
  },
  invoke: function(fn, context, locals) {
    var $__0 = this;
    var args = this.annotate(fn).map((function(token) {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : $__0.getService(token);
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    }));
    if (isArray(fn)) {
      fn = fn[fn.length - 1];
    }
    return fn.apply(context, args);
  },
  annotate: function(fn) {
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
  },
  instantiate: function(Type, locals) {
    var UnwrappedType = isArray(Type) ? Type[Type.length - 1] : Type;
    var instance = Object.create(UnwrappedType.prototype);
    this.invoke(Type, instance, locals);
    return instance;
  }
}, {});
