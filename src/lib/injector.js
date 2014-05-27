function  createInjector(modulesToLoad) {
  var cache = {};

  var $provide = {
    constant: (key, value) => cache[key] = value
  }

  modulesToLoad.forEach((moduleName) => {
    var module = window.angular.module(moduleName);

    module._invokeQueue.forEach((invokeArgs) => {
      var [method, args] = invokeArgs;
      $provide[method].apply($provide, args);
    });
  });

  return {
    has: (name) => cache.hasOwnProperty(name)
  }
}

export {
  createInjector
}
