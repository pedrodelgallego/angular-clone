import {expect} from "chai"
import {setupModuleLoader} from "../lib/loader.js"

describe("angular loaders", () => {
  var window;
  beforeEach(() => { window = {}; });

  describe("Angular", () => {
    describe('setupModuleLoader', () => {
      beforeEach(function() { setupModuleLoader(window); });

      it('exposes angular on the window', () => {
        expect(window.angular).to.not.be.undefined;
      });

      it('creates angular just once', () => {
        var ng = window.angular;
        setupModuleLoader(window);
        expect(window.angular).to.be.equal(ng);
      });
    });
  });

  describe("module", () => {
    beforeEach(function() { setupModuleLoader(window); });

    it('exposes the angular module function', () => {
      expect(window.angular.module).to.not.be.undefined
    });

    it('exposes the angular module function just once', function() {
      var module = window.angular.module;
      setupModuleLoader(window);
      expect(window.angular.module).to.be.equal(module);
    });

    it('allows registering a module', function() {
      var myModule = window.angular.module('myModule', []);
      expect(myModule).to.not.be.undefined;
      expect(myModule.name).to.be.equal('myModule');
    });

    it('replaces a module when registered with same name again', function() {
      var myModule = window.angular.module('myModule', []);
      var myNewModule = window.angular.module('myModule', []);
      expect(myNewModule).not.equal(myModule);
    });
  });
});
