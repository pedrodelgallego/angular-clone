function createModule(name, requires) {
  return { name, requires }
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
