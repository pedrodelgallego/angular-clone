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
import {isString, isArray, isFunction} from "./angular.js"

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG = /^\s*(\S+)\s*$/;

function assertHasOwnPropertyName(key){
  if (key === 'hasOwnProperty') {
    throw new Error('hasOwnProperty is not a valid constant name!');
  };
}

function  INSTANTIATING() { };

export class Injector {
  constructor(modulesToLoad){
    this.providerCache = { };
    this.instanceCache = { };
    this.loadedModules = { };
    this.path = [];

    this.providerInjector = this.createInternalInjector(this.providerCache, () => {
      throw 'Unknown provider: '+ this.path.join(' <- ');
    });

    this.instanceInjector = this.createInternalInjector(this.instanceCache, (name) => {
      var provider = providerInjector.get(name + 'Provider');
      return instanceInjector.invoke(provider.$get, provider);
    });

    this.$provide = {
      constant: (key, value) => {
        assertHasOwnPropertyName(key);
        this.providerCache[key] = value;
        return this.instanceCache[key] = value;
      },

      provider: (key, provider) => {
        if (isFunction(provider)) {
          provider = this.providerInjector.instantiate(provider);
        }
        return this.providerCache[key + "Provider"] =  provider;
      }
    };

    var loadModule = (moduleName) => {
      var module;

      if (!this.loadedModules.hasOwnProperty(moduleName)) {
        this.loadedModules[moduleName] = true;
        module = angular.module(moduleName);
        this.loadedModules[moduleName] = module;

        module.requires.forEach(loadModule)

        module._invokeQueue.forEach((invokeArgs) => {
          var [method, args] = invokeArgs;
          this.$provide[method].apply(this.$provide, args);
        });
      }
    }

    modulesToLoad.forEach(loadModule);

    return this.instanceInjector;
  }

  getService(name) {
    if (this.instanceCache.hasOwnProperty(name)){
      if (this.instanceCache[name] === INSTANTIATING) {
        throw new Error('Circular dependency found: ' + this.path.join(' <- '));
      }
      return this.instanceCache[name];
    } else if (this.providerCache.hasOwnProperty(name)) {
      return this.providerCache[name];
    } else if (this.providerCache.hasOwnProperty(name + "Provider")){
      this.path.unshift(name);
      var provider = this.providerCache[name + 'Provider'];
      try {
        this.instanceCache[name] = INSTANTIATING;
        this.instanceCache[name] = this.invoke(provider.$get);
      } finally {
        this.path.shift();
        if (this.instanceCache[name] === INSTANTIATING) {
          delete this.instanceCache[name];
        }
      }
      return this.instanceCache[name];
    }
  }

  /**
   * @name $injector#has
   *
   * @description
   * Allows the user to query if the particular service exists.
   *
   * @param {string} Name of the service to query.
   * @returns {boolean} returns true if injector has given service.
   */
  has(name) {
    return this.instanceCache.hasOwnProperty(name) ||
      this.providerCache.hasOwnProperty(name + 'Provider');
  }

  /**
   * @name $injector#get
   *
   * @description
   * Return an instance of the service.
   *
   * @param {string} name The name of the instance to retrieve.
   * @return {*} The instance.
   */
  get(name) {
    return this.getService(name);
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
  invoke(fn, context, locals) {
    var args = this.annotate(fn).map((token) => {
      if (isString(token)) {
        var hasLocalProperty = locals && locals.hasOwnProperty(token);
        return hasLocalProperty ? locals[token] : this.getService(token);
      } else {
        throw new Error('Incorrect injection token! Expected a string, got `token`');
      }
    });

    if (isArray(fn)) {
      fn = fn[fn.length - 1];
    }

    return fn.apply(context, args);
  }

  annotate(fn) {
    if (isArray(fn)) {
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

  instantiate(Type, locals){
    var UnwrappedType = isArray(Type) ? Type[Type.length - 1] : Type;
    var instance = Object.create(UnwrappedType.prototype);
    this.invoke(Type, instance, locals);
    return instance;
  }

  createInternalInjector(cache, factoryFn) {

    function getService(name) {
      if (cache.hasOwnProperty(name)) {
        if (cache[name] === INSTANTIATING) {
          throw new Error('Circular dependency found: ' + this.path.join(' <- '));
        }
        return cache[name];
      } else {
        this.path.unshift(name);
        cache[name] = INSTANTIATING;
        try {
          return (cache[name] = factoryFn(name));
        } finally {
          this.path.shift();
          if (cache[name] === INSTANTIATING) {
            delete cache[name];
          }
        }
      }
    }

    var invoke = (fn, self, locals) => {
      var args = this.annotate(fn).map((token) => {
        if (isString(token)) {
          return locals && locals.hasOwnProperty(token) ?
            locals[token] :
            getService(token);
        } else {
          throw 'Incorrect injection token! Expected a string, got '+token;
        }
      });
      if (isArray(fn)) {
        fn = fn[fn.length - 1];
      }
      return fn.apply(self, args);
    }

    var instantiate = (Type, locals) => {
      var UnwrappedType = isArray(Type) ? Type[Type.length - 1] : Type;
      var instance = Object.create(UnwrappedType.prototype);
      invoke(Type, instance, locals);
      return instance;
    }

    return {
      has: function(name) {
        return cache.hasOwnProperty(name) || providerCache.hasOwnProperty(name + 'Provider');
      },
      get: getService,
      annotate: this.annotate,
      invoke: invoke,
      instantiate: instantiate
    };
  }
}
