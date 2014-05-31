import {expect} from "chai"
import {createInjector} from "../lib/injector.js"
import {setupModuleLoader} from "../lib/loader.js"

describe('injector', () => {

  beforeEach(function() {
    delete global.angular;
    window = global;
    setupModuleLoader(window);
  });

  it('can be created', () => {
    var injector = createInjector([]);
    expect(injector).to.not.be.undefined;
  });

  describe("constant", () => {
    var module;
    beforeEach( () => module = angular.module('myModule', []) );

    it('has a constant that has been registered to a module', () => {
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.equal(true);
    });

    it('does not have a non-registered constant', () => {
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.eql(false);
    });

    it('does not allow a constant called hasOwnProperty', () => {
      module.constant('hasOwnProperty', 4);
      expect(() => createInjector(['myModule'])).to.throw();
    });

    it('can return a registered constant', () => {
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.get('aConstant')).to.be.equal(42);
    });
  });

  describe("loading multiple modules", () => {
    it('loads multiple modules', () => {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', []);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = createInjector(['myModule', 'myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    });

    it('loads the required modules of a module', function() {
      var module1 = angular.module('myModule', []);
      var module2 = angular.module('myOtherModule', ['myModule']);
      module1.constant('aConstant', 42);
      module2.constant('anotherConstant', 43);
      var injector = createInjector(['myOtherModule']);
      expect(injector.has('aConstant')).to.be.equal(true);
      expect(injector.has('anotherConstant')).to.be.equal(true);
    });

    it('loads the transitively required modules of a module', () => {
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
    });

    it('loads each module only once', () => {
      var module1 = angular.module('myModule', ['myOtherModule']);
      var module2 = angular.module('myOtherModule', ['myModule']);
      createInjector(['myModule']);
    });
  });

  describe("dependency injection", () => {
    it('invokes an annotated function with dependency injection', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
      var fn = (one, two) => one + two; ;
      fn.$inject = ['a', 'b'];
      expect(injector.invoke(fn)).to.be.equal(3);
    });

    it('does not accept non-strings as injection tokens', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      var injector = createInjector(['myModule']);
      var fn = (one, two) => one + two; ;
      fn.$inject = ['a', 2];
      expect(function() { injector.invoke(fn);} ).to.throw();
    });

    it('invokes a function with the given this context', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      var injector = createInjector(['myModule']);
      var obj = {
        two: 2,
        fn: function(one) { return one + this.two; }
      };

      obj.fn.$inject = ['a'];
      expect(injector.invoke(obj.fn, obj)).to.be.equal(3);
    });
  });
});
