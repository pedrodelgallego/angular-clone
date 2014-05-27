var modules = {};

function  createModule(name, requires, modules) {
  if (name === 'hasOwnProperty') {
    throw new Error(`module name can not be hasOwnProperty`);
  }

  var moduleInstance = {
    name,
    requires,
    constant: function(key, value){
      moduleInstance._invokeQueue.push(['constant', [key, value]]);
    },
    _invokeQueue: []
  };

  modules[name] = moduleInstance;

  return modules[name];
}

function getModule(name, modules){
  if (!modules[name]){
    throw new Error(`module ${ name } has not been registered`);
  }

  return modules[name];
}

function module(name, requires){
  if(requires){
    return createModule(name, requires, modules)
  } else {
    return getModule(name, modules);
  }
}

function setupModuleLoader(window) {
  var ensure = function(obj, name, factory) {
    return obj[name] || (obj[name] = factory(name));
  };

  var angular = ensure(window, 'angular', Object);

  ensure(angular, 'module', () => module);
}

export {
  setupModuleLoader
}
