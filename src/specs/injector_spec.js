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
    it('has a constant that has been registered to a module', () => {
      var module = window.angular.module('myModule', []);
      module.constant('aConstant', 42);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.equal(true);
    });

    it('does not have a non-registered constant', () => {
      var module = window.angular.module('myModule', []);
      var injector = createInjector(['myModule']);
      expect(injector.has('aConstant')).to.eql(false);
    });

    it('does not allow a constant called hasOwnProperty', () => {
      var module = angular.module('myModule', []);
      module.constant('hasOwnProperty', 4);
      expect(() => createInjector(['myModule'])).to.throw();
    });
  });
});
