import {isString} from "./angular.js"

function  createInjector(modulesToLoad) {
  var cache = {};
  var loadedModules = {};

  var $provide = {
    constant: (key, value) => {
      if (key === 'hasOwnProperty') {
        throw new Error('hasOwnProperty is not a valid constant name!');
      }
      return cache[key] = value;
    }
  }

  function invoke(fn, context, locals) {
    var args = fn.$inject.map((token) => {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : cache[token];
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    });

    return fn.apply(context, args);
  }

  modulesToLoad.forEach(function loadModule(moduleName) {
    var module;
    if (!loadedModules.hasOwnProperty(moduleName)) {
      loadedModules[moduleName] = true;
      module = window.angular.module(moduleName);
      loadedModules[moduleName] = module;

      module.requires.forEach(loadModule)

      module._invokeQueue.forEach((invokeArgs) => {
        var [method, args] = invokeArgs;
        $provide[method].apply($provide, args);
      });
    }
  });

  return {
    has: (name) => cache.hasOwnProperty(name),
    get: (name) => cache[name],
    invoke
  }
}

export {
  createInjector
}
