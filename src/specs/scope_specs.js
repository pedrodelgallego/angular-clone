var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

import {Scope} from "../lib/scope.js"

describe("Scope", () => {
  it("can be constructed and used as an object", () => {
    var scope = new Scope();
    scope.aProperty = 1;
    expect(scope.aProperty).to.equal(1);
  });

  describe("digest", () => {
    var scope;
    beforeEach(() => {
      scope = new Scope();
    });

    it("calls the listener function of a watch on first $digest", () => {
      var watchFn = function() { return 'wat'; };
      var listenerFn = sinon.spy();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn.callCount).to.equal(1);
    });

    it("calls the watch function with the scope as the argument", () => {
      var watchFn = sinon.spy();
      var listenerFn = () => { };

      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(watchFn.calledWith(scope)).to.equal(true);
    });

    it("calls the listener function when the watched value changes", () => {
      scope.someValue = 'a';
      scope.counter = 0;
      expect(scope.counter).to.equal(0);

      var watchFn  = (scope) => {return scope.someValue;}
      var listenerFn = (newValue, oldValue, scope) => { scope.counter++; }
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
    });

    it("calls listener with new value as old value the first time", () => {
      scope.someValue = 123;
      var oldValueGiven;
      var watchFn = (scope) => { return scope.someValue; };
      var listenerFn = (newValue, oldValue, scope) => {oldValueGiven = oldValue; };

      scope.$watch(watchFn, listenerFn);

      scope.$digest();
      expect(oldValueGiven).to.equal(123);
    });
  });
});
