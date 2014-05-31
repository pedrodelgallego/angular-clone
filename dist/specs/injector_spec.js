"use strict";
var __moduleName = "injector_spec";
var expect = $traceurRuntime.assertObject(require("chai")).expect;
var createInjector = $traceurRuntime.assertObject(require("../lib/injector.js")).createInjector;
var setupModuleLoader = $traceurRuntime.assertObject(require("../lib/loader.js")).setupModuleLoader;
describe('injector', (function() {
  beforeEach(function() {
    delete global.angular;
    window = global;
    setupModuleLoader(window);
  });
  it('can be created', (function() {
    var injector = createInjector([]);
    expect(injector).to.not.be.undefined;
  }));
  describe("constant", (function() {
    var module;
    beforeEach((function() {
      return module = angular.module('myModule', []);
    }));
    it('has a constant that has been registered to a module', (function() {
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.equal(true);
    }));
    it('does not have a non-registered constant', (function() {
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.eql(false);
    }));
    it('does not allow a constant called hasOwnProperty', (function() {
      module.constant('hasOwnProperty', 4);
      expect((function() {
        return createInjector(['myModule']);
      })).to.throw();
    }));
    it('can return a registered constant', (function() {
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.get('aConstant')).to.be.equal(42);
    }));
  }));
  describe("loading multiple modules", (function() {
    it('loads multiple modules', (function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', []);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = createInjector(['myModule', 'myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    }));
    it('loads the required modules of a module', function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', ['myModule']);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = createInjector(['myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    });
    it('loads the transitively required modules of a module', (function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', ['myModule']);
      var module3 = angular.module('myThirdModule', ['myOtherModule']);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      module3.constant('aThirdConstant', 44);
      var injector = createInjector(['myThirdModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
      expect(injector.has('aThirdConstant')).to.be.equal(true);
    }));
    it('loads each module only once', (function() {
      var module1 = angular.module('myModule', ['myOtherModule']);
      var module2 = angular.module('myOtherModule', ['myModule']);
      createInjector(['myModule']);
    }));
  }));
  describe("dependency injection", (function() {
    it('invokes an annotated function with dependency injection', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
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
      var injector = createInjector(['myModule']);
      var fn = (function(one, two) {
        return one + two;
      });
      ;
      fn.$inject = ['a', 2];
      expect(function() {
        injector.invoke(fn);
      }).to.throw();
    }));
    it('invokes a function with the given this context', (function() {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      var injector = createInjector(['myModule']);
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
      var injector = createInjector(['myModule']);
      var fn = function(one, two) {
        return one + two;
      };
      fn.$inject = ['a', 'b'];
      expect(injector.invoke(fn, undefined, {b: 3})).to.be.equal(4);
    }));
  }));
}));
