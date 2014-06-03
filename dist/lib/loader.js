"use strict";
Object.defineProperties(exports, {
  setupModuleLoader: {get: function() {
      return setupModuleLoader;
    }},
  __esModule: {value: true}
});
var __moduleName = "loader";
var modules = {};
function createModule(name, requires, modules) {
  if (name === 'hasOwnProperty') {
    throw new Error("module name can not be hasOwnProperty");
  }
  var invokeLater = (function(method) {
    return function() {
      moduleInstance._invokeQueue.push([method, arguments]);
      return moduleInstance;
    };
  });
  var moduleInstance = {
    name: name,
    requires: requires,
    constant: invokeLater('constant'),
    provider: invokeLater('provider'),
    _invokeQueue: []
  };
  modules[name] = moduleInstance;
  return modules[name];
}
function getModule(name, modules) {
  if (!modules[name]) {
    throw new Error(("module " + name + " has not been registered"));
  }
  return modules[name];
}
function module(name, requires) {
  if (requires) {
    return createModule(name, requires, modules);
  } else {
    return getModule(name, modules);
  }
}
function setupModuleLoader(window) {
  var ensure = function(obj, name, factory) {
    return obj[name] || (obj[name] = factory(name));
  };
  var angular = ensure(window, 'angular', Object);
  ensure(angular, 'module', (function() {
    return module;
  }));
}
;
