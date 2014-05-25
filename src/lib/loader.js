var modules = {};

function createModule(name, requires) {
  if (requires) {
    modules[name] = { name, requires };
  }

  if (!modules[name]){
    throw new Error(`module ${ name } has not been registered`);
  }

  return modules[name];
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
