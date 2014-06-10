"use strict";
var __moduleName = "injector_spec";
var expect = $traceurRuntime.assertObject(require("chai")).expect;
var Injector = $traceurRuntime.assertObject(require("../lib/injector.js")).Injector;
var setupModuleLoader = $traceurRuntime.assertObject(require("../lib/loader.js")).setupModuleLoader;
function identity(value) {
  return (function() {
    return value;
  });
}
;
describe('injector', (function() {
  beforeEach((function() {
    delete global.angular;
    setupModuleLoader(global);
  }));
  it('can be created', (function() {
    var injector = new Injector([]);
    expect(injector).to.not.be.undefined;
  }));
  describe("constant", (function() {
    var module;
    beforeEach((function() {
      return module = angular.module('myModule', []);
    }));
    it('has a constant that has been registered to a module', (function() {
      module.constant('aConstant', 42);
      var injector = new Injector(['myModule']);
      expect(injector.has('aConstant')).to.equal(true);
    }));
    it('does not have a non-registered constant', (function() {
      var injector = new Injector(['myModule']);
      expect(injector.has('aConstant')).to.eql(false);
    }));
    it('does not allow a constant called hasOwnProperty', (function() {
      module.constant('hasOwnProperty', 4);
      expect((function() {
        return new Injector(['myModule']);
      })).to.throw();
    }));
    it('can return a registered constant', (function() {
      module.constant('aConstant', 42);
      var injector = new Injector(['myModule']);
      expect(injector.get('aConstant')).to.be.equal(42);
    }));
  }));
  describe("loading multiple modules", (function() {
    it('loads multiple modules', (function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', []);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = new Injector(['myModule', 'myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    }));
    it('loads the required modules of a module', (function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', ['myModule']);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = new Injector(['myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    }));
    it('loads the transitively required modules of a module', (function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', ['myModule']);
      var module3 = angular.module('myThirdModule', ['myOtherModule']);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      module3.constant('aThirdConstant', 44);
      var injector = new Injector(['myThirdModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
      expect(injector.has('aThirdConstant')).to.be.equal(true);
    }));
    it('loads each module only once', (function() {
      var module1 = angular.module('myModule', ['myOtherModule']);
      var module2 = angular.module('myOtherModule', ['myModule']);
      new Injector(['myModule']);
    }));
  }));
  describe("dependency injection", (function() {
    it('invokes an annotated function with dependency injection', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = new Injector(['myModule']);
      var fn = (function(one, two) {
        return one + two;
      });
      ;
      fn.$inject = ['a', 'b'];
      expect(injector.invoke(fn)).to.be.equal(3);
    }));
    it('does not accept non-strings as injection tokens', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      var injector = new Injector(['myModule']);
      var fn = (function(one, two) {
        return one + two;
      });
      ;
      fn.$inject = ['a', 2];
      expect((function() {
        return injector.invoke(fn);
      })).to.throw();
    }));
    it('invokes a function with the given this context', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      var injector = new Injector(['myModule']);
      var obj = {
        two: 2,
        fn: function(one) {
          return one + this.two;
        }
      };
      obj.fn.$inject = ['a'];
      expect(injector.invoke(obj.fn, obj)).to.be.equal(3);
    }));
    it('overrides dependencies with locals when invoking', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = new Injector(['myModule']);
      var fn = (function(one, two) {
        return one + two;
      });
      ;
      fn.$inject = ['a', 'b'];
      expect(injector.invoke(fn, undefined, {b: 3})).to.be.equal(4);
    }));
  }));
  describe('annotate', (function() {
    it('returns a functions $inject annotation when it has one', (function() {
      var injector = new Injector([]);
      var fn = (function() {});
      fn.$inject = ['a', 'b'];
      expect(injector.annotate(fn)).to.be.eql(['a', 'b']);
    }));
    it('returns the array-style annotations of a function', (function() {
      var injector = new Injector([]);
      var fn = ['c', 'd', (function() {})];
      expect(injector.annotate(fn)).to.be.eql(['c', 'd']);
    }));
    it('returns an empty array for a non-annotated 0-arg function', (function() {
      var injector = new Injector([]);
      var fn = (function() {});
      expect(injector.annotate(fn)).to.be.eql([]);
    }));
    it('returns annotations parsed from function args when not annotated', (function() {
      var injector = new Injector([]);
      var fn = (function(a, b) {});
      expect(injector.annotate(fn)).to.be.eql(['a', 'b']);
    }));
    it('strips comments from argument lists when parsing', (function() {
      var injector = new Injector([]);
      var fn = (function(a, c) {});
      expect(injector.annotate(fn)).to.be.eql(['a', 'c']);
    }));
  }));
  describe('invoke + annotate', (function() {
    it('invokes an array-annotated function with dependency injection', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = new Injector(['myModule']);
      var fn = ['a', 'b', (function(one, two) {
        return one + two;
      })];
      expect(injector.invoke(fn)).to.be.equal(3);
    }));
    it('invokes a non-annotated function with dependency injection', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = new Injector(['myModule']);
      var fn = (function(a, b) {
        return a + b;
      });
      expect(injector.invoke(fn)).to.be.equal(3);
    }));
    ;
  }));
  describe('instantiate', (function() {
    var module,
        injector;
    beforeEach(function() {
      module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      injector = new Injector(['myModule']);
    });
    it('instantiates an annotated constructor function', (function() {
      function Type(one, two) {
        this.result = one + two;
      }
      Type.$inject = ['a', 'b'];
      var instance = injector.instantiate(Type);
      expect(instance.result).to.be.equal(3);
    }));
    it('instantiates a non-annotated constructor function', (function() {
      function Type(a, b) {
        this.result = a + b;
      }
      var instance = injector.instantiate(Type);
      expect(instance.result).to.be.equal(3);
    }));
    it('uses the prototype of the constructor when instantiating', (function() {
      function BaseType() {}
      BaseType.prototype.getValue = identity(42);
      function Type() {
        this.v = this.getValue();
      }
      Type.prototype = BaseType.prototype;
      var module = angular.module('myModule', []);
      var injector = new Injector(['myModule']);
      var instance = injector.instantiate(Type);
      expect(instance.v).to.be.equal(42);
    }));
    it('supports locals when instantiating', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = new Injector(['myModule']);
      function Type(a, b) {
        this.result = a + b;
      }
      var instance = injector.instantiate(Type, {b: 3});
      expect(instance.result).to.be.equal(4);
    }));
  }));
  describe("provider", (function() {
    var module;
    beforeEach((function() {
      return module = angular.module('myModule', []);
    }));
    it('allows registering a provider and uses its $get', (function() {
      module.provider('a', {$get: (function() {
          return 42;
        })});
      var injector = new Injector(['myModule']);
      expect(injector.has('a')).to.be.equal(true);
      expect(injector.get('a')).to.be.equal(42);
    }));
    it('injects the $get method of a provider', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.provider('b', {$get: (function(a) {
          return a + 2;
        })});
      var injector = new Injector(['myModule']);
      expect(injector.get('b')).to.be.equal(3);
    }));
    it('injects the $get method of a provider lazily', (function() {
      var module = angular.module('myModule', []);
      module.provider('b', {$get: (function(a) {
          return a + 2;
        })});
      module.provider('a', {$get: identity(1)});
      var injector = new Injector(['myModule']);
      expect(injector.get('b')).to.be.equal(3);
    }));
    it('instantiates a dependency only once', (function() {
      var module = angular.module('myModule', []);
      module.provider('a', {$get: (function() {
          return {};
        })});
      var injector = new Injector(['myModule']);
      expect(injector.get('a')).to.be.equal(injector.get('a'));
    }));
    it('notifies the user about a circular dependency', (function() {
      var module = angular.module('myModule', []);
      module.provider('a', {$get: (function(b) {})});
      module.provider('b', {$get: (function(c) {})});
      module.provider('c', {$get: (function(a) {})});
      var injector = new Injector(['myModule']);
      expect((function() {
        return injector.get('a');
      })).to.throw(/Circular dependency found/);
    }));
    it('cleans up the circular marker when instantiation fails', function() {
      var module = angular.module('myModule', []);
      module.provider('a', {$get: function() {
          throw 'Failing instantiation!';
        }});
      var injector = new Injector(['myModule']);
      expect((function() {
        return injector.get('a');
      })).to.throw('Failing instantiation!');
      expect((function() {
        return injector.get('a');
      })).to.throw('Failing instantiation!');
    });
    it('notifies the user abouta circular dependency', (function() {
      var module = angular.module('myModule', []);
      module.provider('a', {$get: (function(b) {})});
      module.provider('b', {$get: (function(c) {})});
      module.provider('c', {$get: (function(a) {})});
      var injector = new Injector(['myModule']);
      expect((function() {
        return injector.get('a');
      })).to.throw('Circular dependency found: c <- b <- a');
    }));
  }));
}));
