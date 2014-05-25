function createModule(name) {
  var module = {
    name: name
  };

  return module;
}

function setupModuleLoader(window) {
  var ensure = function(obj, name, factory) {
    return obj[name] || (obj[name] = factory(name));
  };
  var angular = ensure(window, 'angular', Object);

  ensure(angular, 'module', function(){
    return createModule;
  });
}

export {
  setupModuleLoader
}
