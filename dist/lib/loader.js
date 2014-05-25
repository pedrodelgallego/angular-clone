"use strict";
Object.defineProperties(exports, {
  setupModuleLoader: {get: function() {
      return setupModuleLoader;
    }},
  __esModule: {value: true}
});
var __moduleName = "loader";
var modules = {};
function createModule(name, requires) {
  if (requires) {
    modules[name] = {
      name: name,
      requires: requires
    };
  }
  return modules[name];
}
function setupModuleLoader(window) {
  var ensure = function(obj, name, factory) {
    return obj[name] || (obj[name] = factory(name));
  };
  var angular = ensure(window, 'angular', Object);
  ensure(angular, 'module', function() {
    return createModule;
  });
}
;
