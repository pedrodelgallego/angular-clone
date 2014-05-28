function  createInjector(modulesToLoad) {
  var cache = {};

  var $provide = {
    constant: (key, value) => {
      if (key === 'hasOwnProperty') {
        throw new Error('hasOwnProperty is not a valid constant name!');
      }
      return cache[key] = value;
    }
  }

  modulesToLoad.forEach(function  loadModule(moduleName) {
    var module = window.angular.module(moduleName);

    module.requires.forEach(loadModule)

    module._invokeQueue.forEach((invokeArgs) => {
      var [method, args] = invokeArgs;
      $provide[method].apply($provide, args);
    });
  });

  return {
    has: (name) => cache.hasOwnProperty(name),
    get: (name) => cache[name]
  }
}

export {
  createInjector
}
