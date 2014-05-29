

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

  function invoke(fn) {
    var args = fn.$inject.map(function(token) {
      return cache[token];
    });
    return fn.apply(null, args);
  }

  modulesToLoad.forEach(function  loadModule(moduleName) {
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
