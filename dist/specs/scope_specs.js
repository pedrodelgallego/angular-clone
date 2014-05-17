"use strict";
var __moduleName = "scope_specs";
var chai = require('chai');
var sinon = require('sinon');
var _ = require('underscore');
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
      var watchFn = (function() {
        return 'wat';
      });
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
        return scope.counter++;
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
        return oldValueGiven = oldValue;
      });
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(oldValueGiven).to.equal(123);
    }));
    it("calls listener when watch value is first undefined", (function() {
      scope.counter = 0;
      var watchFn = (function(scope) {
        return scope.someValue;
      });
      var listenerFn = (function(newValue, oldValue, scope) {
        return scope.counter++;
      });
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(scope.counter).to.equal(1);
    }));
    it("triggers chained watchers in the same digest", (function() {
      scope.name = 'Jane';
      var watchFn = (function(scope) {
        return scope.nameUpper;
      });
      var listenerFn = (function(newValue, oldValue, scope) {
        if (newValue) {
          scope.initial = newValue.substring(0, 1) + '.';
        }
      });
      scope.$watch(watchFn, listenerFn);
      var watchFn2 = (function(scope) {
        return scope.name;
      });
      var listenerFn2 = (function(newValue, oldValue, scope) {
        if (newValue) {
          scope.nameUpper = newValue.toUpperCase();
        }
      });
      scope.$watch(watchFn2, listenerFn2);
      scope.$digest();
      expect(scope.initial).to.equal('J.');
      scope.name = 'Bob';
      scope.$digest();
      expect(scope.initial).to.equal('B.');
    }));
    it("gives up on the watches after 10 iterations", (function() {
      scope.counterA = 0;
      scope.counterB = 0;
      scope.$watch(function(scope) {
        return scope.counterA;
      }, function(newValue, oldValue, scope) {
        scope.counterB++;
      });
      scope.$watch(function(scope) {
        return scope.counterB;
      }, function(newValue, oldValue, scope) {
        scope.counterA++;
      });
      expect((function() {
        scope.$digest();
      })).to.throw(/10 digest iterations reached/);
    }));
    it("ends the digest when the last watch is clean", function() {
      scope.array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      var watchExecutions = 0;
      _.times(10, function(i) {
        scope.$watch((function(scope) {
          watchExecutions++;
          return scope.array[i];
        }), (function() {}));
      });
      scope.$digest();
      expect(watchExecutions).to.equal(20);
      scope.array[0] = 42;
      scope.$digest();
      expect(watchExecutions).to.equal(31);
    });
  }));
}));
