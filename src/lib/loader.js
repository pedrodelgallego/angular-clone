var modules = {};

function  createModule(name, requires, modules) {
  if (name === 'hasOwnProperty') {
    throw new Error(`module name can not be hasOwnProperty`);
  }

  var moduleInstance = {
    name,

    /**
     * @name angular.Module#requires
     *
     * @description
     * Holds the list of modules which the injector will load before
     * the current module is loaded.
     *
     * @returns {Array.<string>} List of module names which must be
     * loaded before this module.
     */
    requires,

    /**
     * @name angular.Module#constant
     *
     * @description
     * Because the constant are fixed, they get applied before other provide methods.
     *
     * @param {string} name constant name
     * @param {*} object Constant value.
     */
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

/**
 * @name angular.module
 * @module ng
 *
 * @description
 * The `angular.module` is a global place for creating, registering and retrieving Angular
 * modules.
 *
 * All modules (angular core or 3rd party) that should be available to an application must be
 * registered using this mechanism.
 *
 * When passed two or more arguments, a new module is created.  If passed only one argument, an
 * existing module (the name passed as the first argument to `module`) is retrieved.
 *
 * # Module
 *
 * A module is a collection of services, directives, filters, and configuration information.
 * `angular.module` is used to configure the {@link auto.$injector $injector}.
 *
 * ```js
 * // Create a new module
 * var myModule = angular.module('myModule', []);
 *
 * // register a new service
 * myModule.value('appName', 'MyCoolApp');
 *
 * // configure existing services inside initialization blocks.
 * myModule.config(['$locationProvider', function($locationProvider) {
 *   // Configure existing providers
 *   $locationProvider.hashPrefix('!');
 * }]);
 * ```
 *
 * However it's more likely that you'll just use
 *
 * @param {!string} name The name of the module to create or retrieve.
 * @param {!Array.<string>=} requires If specified then new module is being created. If
 *        unspecified then the module is being retrieved for further configuration.
 *
 * @returns {module} new module with the  api.
 */
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
