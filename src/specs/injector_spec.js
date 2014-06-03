import {expect} from "chai"
import {createInjector} from "../lib/injector.js"
import {setupModuleLoader} from "../lib/loader.js"

describe('injector', () => {

  beforeEach(() => {
    delete global.angular;
    setupModuleLoader(global);
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

    it('loads the required modules of a module', () => {
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
      expect(() => injector.invoke(fn)).to.throw();
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

    it('overrides dependencies with locals when invoking', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
      var fn = (one, two) => one + two; ;
      fn.$inject = ['a', 'b'];
      expect(injector.invoke(fn, undefined, {b: 3})).to.be.equal(4);
    });
  });

  describe('annotate', () => {
    it('returns a functions $inject annotation when it has one', () => {
      var injector = createInjector([]);
      var fn = () => { };
      fn.$inject = ['a', 'b'];
      expect(injector.annotate(fn)).to.be.eql(['a', 'b']);
    });

    it('returns the array-style annotations of a function', () => {
      var injector = createInjector([]);
      var fn = ['c', 'd', () => {}];
      expect(injector.annotate(fn)).to.be.eql(['c', 'd']);
    });

    it('returns an empty array for a non-annotated 0-arg function', () => {
      var injector = createInjector([]);
      var fn = () => {};
      expect(injector.annotate(fn)).to.be.eql([]);
    });

    it('returns annotations parsed from function args when not annotated', () => {
      var injector = createInjector([]);
      var fn = (a, b) => { };
      expect(injector.annotate(fn)).to.be.eql(['a', 'b']);
    });

    it('strips comments from argument lists when parsing', () => {
      var injector = createInjector([]);
      var fn = (a, /*b,*/ c) => { };
      expect(injector.annotate(fn)).to.be.eql(['a', 'c']);
    });
  });

  describe('invoke + annotate', () => {
    it('invokes an array-annotated function with dependency injection', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
      var fn = ['a', 'b', (one, two) => one + two ];
      expect(injector.invoke(fn)).to.be.equal(3);
    });


    it('invokes a non-annotated function with dependency injection', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
      var fn = (a, b) => a + b;
      expect(injector.invoke(fn)).to.be.equal(3);
    });;
  });

  describe('instantiate', () => {
    var module, injector;

    beforeEach(function(){
      module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      injector = createInjector(['myModule']);
    });

    it('instantiates an annotated constructor function', () => {
      function Type(one, two) { this.result = one + two; }
      Type.$inject = ['a', 'b'];
      var instance = injector.instantiate(Type);
      expect(instance.result).to.be.equal(3);
    });

    it('instantiates a non-annotated constructor function', () => {
      function Type(a, b) { this.result = a + b;}
      var instance = injector.instantiate(Type);
      expect(instance.result).to.be.equal(3);
    });

    it('uses the prototype of the constructor when instantiating', () => {
      var identity = function(value){ return function(){ return value; }};
      function BaseType() { }
      BaseType.prototype.getValue = identity(42);
      function Type() { this.v = this.getValue(); }
      Type.prototype = BaseType.prototype;
      var module = angular.module('myModule', []);
      var injector = createInjector(['myModule']);
      var instance = injector.instantiate(Type);
      expect(instance.v).to.be.equal(42);
    });

    it('supports locals when instantiating', () => {
      var module = angular.module('myModule', []);
      module.constant('a', 1);
      module.constant('b', 2);
      var injector = createInjector(['myModule']);
      function Type(a, b) {
        this.result = a + b;
      }
      var instance = injector.instantiate(Type, {b: 3});
      expect(instance.result).to.be.equal(4);
    });
  });

  describe("provider", () => {
    var module;

    beforeEach(() => module = angular.module('myModule', []));

    it('allows registering a provider and uses its $get', () => {

      module.provider('a', { $get: () => 42 });

      var injector = createInjector(['myModule']);
      expect(injector.has('a')).to.be.equal(true);
      expect(injector.get('a')).to.be.equal(42);
    });
  });
});
