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
      var watchFn = () => 'wat';
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

      var watchFn  = scope => scope.someValue;
      var listenerFn = (newValue, oldValue, scope) => scope.counter++;
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
      var watchFn    = scope =>  scope.someValue;
      var listenerFn = (newValue, oldValue, scope) => oldValueGiven = oldValue;
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(oldValueGiven).to.equal(123);
    });

    it("calls listener when watch value is first undefined", () => {
      scope.counter = 0;
      var watchFn    = scope => scope.someValue;
      var listenerFn = (newValue, oldValue, scope) => scope.counter++;
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(scope.counter).to.equal(1);
    });

    // it("may have watchers that omit the listener function", () => {
    //   var watchFn = sinon.stub().returns('something');
    //   scope.$watch(watchFn);
    //   scope.$digest();
    //   expect(watchFn.callCount).to.equal(1);
    // });

    it("triggers chained watchers in the same digest", () => {
      scope.name = 'Jane';
      var watchFn = scope => scope.nameUpper;
      var listenerFn = (newValue, oldValue, scope) => {
        if (newValue) {
          scope.initial = newValue.substring(0, 1) + '.';
        }
      };
      scope.$watch(watchFn, listenerFn);

      var watchFn2 = scope => scope.name;
      var listenerFn2 = (newValue, oldValue, scope) => {
        if (newValue) {
          scope.nameUpper = newValue.toUpperCase();
        }
      };
      scope.$watch(watchFn2, listenerFn2);

      scope.$digest();
      expect(scope.initial).to.equal('J.');
      scope.name = 'Bob';
      scope.$digest();
      expect(scope.initial).to.equal('B.');
    });

    it("gives up on the watches after 10 iterations", function() {
      scope.counterA = 0;
      scope.counterB = 0;
      scope.$watch(
        function(scope) { return scope.counterA; },
        function(newValue, oldValue, scope) {
          scope.counterB++;
        }
      );
      scope.$watch(
        function(scope) { return scope.counterB; },
        function(newValue, oldValue, scope) {
          scope.counterA++;
        }
      );
      expect((function() { scope.$digest(); })).to.throw(/10 digest iterations reached/);
    });
  });

});
