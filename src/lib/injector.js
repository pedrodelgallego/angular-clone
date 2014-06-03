/**
 * @module ng
 * @name angular.injector
 *
 * @description
 * Creates an injector function that can be used for retrieving services as well as for
 * dependency injection
 *
 * @param {Array.<string|Function>} modules A list of module functions
 * or their aliases.
 *
 * @returns {function()} Injector function.
 *
 * @example
 * Typical usage
 * ```js
 *   // create an injector
 *   var $injector = angular.injector(['ng']);
 *
 *   // use the injector to kick off your application
 *   // use the type inference to auto inject arguments, or use implicit injection
 *   $injector.invoke(function($rootScope, $compile, $document){
 *     $compile($document)($rootScope);
 *     $rootScope.$digest();
 *   });
 * ```
 */
import {isString, isArray} from "./angular.js"

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG = /^\s*(\S+)\s*$/;

function  createInjector(modulesToLoad) {
  var cache = {};
  var loadedModules = {};

  var $provide = {
    constant: (key, value) => {
      if (key === 'hasOwnProperty') {
        throw new Error('hasOwnProperty is not a valid constant name!');
      }
      return cache[key] = value;
    },

    provider: (key, provider) => cache[key] = provider.$get()

  };

  function instantiate(Type, locals){
    var UnwrappedType = isArray(Type) ? Type[Type.length - 1] : Type;
    var instance = Object.create(UnwrappedType.prototype);
    invoke(Type, instance, locals);
    return instance;
  }

  function annotate(fn) {
    if (isArray(fn)){
      return fn.slice(0, fn.length - 1);
    } else if (fn.$inject) {
      return fn.$inject;
    }else if (!fn.length) {
      return [];
    } else {
      var argDeclaration = fn.toString().match(FN_ARGS);
      return argDeclaration[1].split(',').map((arg) => arg.replace(/\s/g, ""));
    }
  }

  /**
   * @name $injector#invoke
   *
   * @description
   * Invoke the method and supply the method arguments from the `$injector`.
   *
   * @param {!Function} fn The function to invoke.
   * @param {Object=} context The `this` for the invoked method.
   * @param {Object=} locals Optional object. If preset then any argument names are read from this
   *                         object first, before the `$injector` is consulted.
   * @returns {*} the value returned by the invoked `fn` function.
   */
  function invoke(fn, context, locals) {
    var args = annotate(fn).map((token) => {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : cache[token];
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    });

    if (isArray(fn)) {
      fn = fn[fn.length - 1];
    }

    return fn.apply(context, args);
  }

  modulesToLoad.forEach(function loadModule(moduleName) {
    var module;
    if (!loadedModules.hasOwnProperty(moduleName)) {
      loadedModules[moduleName] = true;
      module = angular.module(moduleName);
      loadedModules[moduleName] = module;

      module.requires.forEach(loadModule)

      module._invokeQueue.forEach((invokeArgs) => {
        var [method, args] = invokeArgs;
        $provide[method].apply($provide, args);
      });
    }
  });

  return {
    /**
     * @name $injector#has
     *
     * @description
     * Allows the user to query if the particular service exists.
     *
     * @param {string} Name of the service to query.
     * @returns {boolean} returns true if injector has given service.
     */
    has: (name) => cache.hasOwnProperty(name),

    /**
     * @name $injector#get
     *
     * @description
     * Return an instance of the service.
     *
     * @param {string} name The name of the instance to retrieve.
     * @return {*} The instance.
     */
    get: (name) => cache[name],

    invoke,
    annotate,
    instantiate
  }
}

export {
  createInjector
}
