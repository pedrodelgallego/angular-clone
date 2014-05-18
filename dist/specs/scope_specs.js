"use strict";
var __moduleName = "scope_specs";
var chai = require('chai');
var sinon = require('sinon');
var _ = require('lodash');
var expect = chai.expect;
var Scope = $traceurRuntime.assertObject(require("../lib/scope.js")).Scope;
describe("Scope", (function() {
  var scope;
  beforeEach((function() {
    scope = new Scope();
  }));
  it("can be constructed and used as an object", (function() {
    scope.aProperty = 1;
    expect(scope.aProperty).to.equal(1);
  }));
  describe("digest", (function() {
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
    it("may have watchers that omit the listener function", (function() {
      var watchFn = sinon.stub().returns('something');
      scope.$watch(watchFn);
      scope.$digest();
      expect(watchFn.callCount).to.not.equal(0);
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
      scope.$watch((function(scope) {
        return scope.counterA;
      }), (function(newValue, oldValue, scope) {
        scope.counterB++;
      }));
      scope.$watch((function(scope) {
        return scope.counterB;
      }), (function(newValue, oldValue, scope) {
        scope.counterA++;
      }));
      expect(((function() {
        scope.$digest();
      }))).to.throw(/10 digest iterations reached/);
    }));
    it("ends the digest when the last watch is clean", function() {
      scope.array = _.range(100);
      var watchExecutions = 0;
      _.times(100, function(i) {
        scope.$watch((function(scope) {
          watchExecutions++;
          return scope.array[i];
        }), (function() {}));
      });
      scope.$digest();
      expect(watchExecutions).to.equal(200);
      scope.array[0] = 42;
      scope.$digest();
      expect(watchExecutions).to.equal(301);
    });
    it("compares based on value if enabled", (function() {
      scope.aValue = [1, 2, 3];
      scope.counter = 0;
      var watchFn = (function(scope) {
        return scope.aValue;
      });
      var listenerFn = (function(newValue, oldValue, scope) {
        return scope.counter++;
      });
      scope.$watch(watchFn, listenerFn, true);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.aValue.push(4);
      scope.$digest();
      expect(scope.counter).to.equal(2);
    }));
  }));
  describe("$eval", (function() {
    it("executes $eval'ed function and returns result", function() {
      scope.aValue = 42;
      var result = scope.$eval((function(scope) {
        return scope.aValue;
      }));
      expect(result).to.equal(42);
    });
    it("passes the second $eval argument straight through", function() {
      scope.aValue = 45;
      var result = scope.$eval((function(scope, foo, bar) {
        return scope.aValue + foo + bar;
      }), 2, 3);
      expect(result).to.equal(50);
    });
  }));
  describe("$apply", (function() {
    it("executes $apply'ed function and starts the digest", function() {
      scope.aValue = 'someValue';
      scope.counter = 0;
      var watchFn = (function(scope) {
        return scope.aValue;
      });
      var listener = (function(newValue, oldValue, scope) {
        return scope.counter++;
      });
      scope.$watch(watchFn, listener);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.$apply((function(scope) {
        return scope.aValue = 'someOtherValue';
      }));
      expect(scope.counter).to.equal(2);
    });
  }));
}));
