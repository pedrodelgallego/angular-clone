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
    it('has a constant that has been registered to a module', (function() {
      var module = window.angular.module('myModule', []);
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.equal(true);
    }));
    it('does not have a non-registered constant', (function() {
      var module = window.angular.module('myModule', []);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.eql(false);
    }));
    it('does not allow a constant called hasOwnProperty', (function() {
      var module = angular.module('myModule', []);
      module.constant('hasOwnProperty', 4);
      expect((function() {
        return createInjector(['myModule']);
      })).to.throw();
    }));
  }));
}));
