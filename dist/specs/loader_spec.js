"use strict";
var __moduleName = "loader_spec";
var expect = $traceurRuntime.assertObject(require("chai")).expect;
var setupModuleLoader = $traceurRuntime.assertObject(require("../lib/loader.js")).setupModuleLoader;
describe("angular loaders", (function() {
  var window;
  beforeEach((function() {
    window = {};
  }));
  describe("Angular", (function() {
    describe('setupModuleLoader', (function() {
      beforeEach(function() {
        setupModuleLoader(window);
      });
      it('exposes angular on the window', (function() {
        expect(window.angular).to.not.be.undefined;
      }));
      it('creates angular just once', (function() {
        var ng = window.angular;
        setupModuleLoader(window);
        expect(window.angular).to.be.equal(ng);
      }));
    }));
  }));
  describe("module", (function() {
    beforeEach(function() {
      setupModuleLoader(window);
    });
    it('exposes the angular module function', (function() {
      expect(window.angular.module).to.not.be.undefined;
    }));
    it('exposes the angular module function just once', (function() {
      var module = window.angular.module;
      setupModuleLoader(window);
      expect(window.angular.module).to.be.equal(module);
    }));
    it('allows registering a module', (function() {
      var myModule = window.angular.module('myModule', []);
      expect(myModule).to.not.be.undefined;
      expect(myModule.name).to.be.equal('myModule');
    }));
    it('replaces a module when registered with same name again', (function() {
      var myModule = window.angular.module('myModule', []);
      var myNewModule = window.angular.module('myModule', []);
      expect(myNewModule).not.equal(myModule);
    }));
    it('attaches the requires array to the registered module', (function() {
      var myModule = window.angular.module('myModule', ['myOtherModule']);
      expect(myModule.requires).to.be.eql(['myOtherModule']);
    }));
    it('allows getting a module', (function() {
      var myModule = window.angular.module('myModule', []);
      var gotModule = window.angular.module('myModule');
      expect(gotModule).to.not.be.undefined;
      expect(gotModule).to.be.equal(myModule);
    }));
    it('throws when trying to get a nonexisting module', function() {
      expect(function() {
        window.angular.module('tomato');
      }).to.throw();
    });
  }));
}));
