"use strict";
var __moduleName = "scope_specs";
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var Scope = $traceurRuntime.assertObject(require("../lib/scope.js")).Scope;
describe("Scope", (function() {
  it("can be constructed and used as an object", (function() {
    var scope = new Scope();
    scope.aProperty = 1;
    expect(scope.aProperty).to.equal(1);
  }));
  describe("digest", (function() {
    var scope;
    beforeEach((function() {
      scope = new Scope();
    }));
    it("calls the listener function of a watch on first $digest", (function() {
      var watchFn = function() {
        return 'wat';
      };
      var listenerFn = sinon.spy();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn.callCount).to.equal(1);
    }));
    it("calls the watch function with the scope as the argument", (function() {
      var watchFn = sinon.spy();
      var listenerFn = (function() {});
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(watchFn.calledWith(scope)).to.equal(true);
    }));
    it("calls the listener function when the watched value changes", (function() {
      scope.someValue = 'a';
      scope.counter = 0;
      expect(scope.counter).to.equal(0);
      var watchFn = (function(scope) {
        return scope.someValue;
      });
      var listenerFn = (function(newValue, oldValue, scope) {
        scope.counter++;
      });
      scope.$watch(watchFn, listenerFn);
      expect(scope.counter).to.equal(0);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.someValue = 'b';
      expect(scope.counter).to.equal(1);
      scope.$digest();
      expect(scope.counter).to.equal(2);
    }));
    it("calls listener with new value as old value the first time", (function() {
      scope.someValue = 123;
      var oldValueGiven;
      var watchFn = (function(scope) {
        return scope.someValue;
      });
      var listenerFn = (function(newValue, oldValue, scope) {
        oldValueGiven = oldValue;
      });
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(oldValueGiven).to.equal(123);
    }));
  }));
}));
