"use strict";
var __moduleName = "scope_specs";
var expect = $traceurRuntime.assertObject(require("chai")).expect;
var $__0 = $traceurRuntime.assertObject(require("lodash")),
    range = $__0.range,
    times = $__0.times;
var $__0 = $traceurRuntime.assertObject(require("sinon")),
    stub = $__0.stub,
    spy = $__0.spy;
var Scope = $traceurRuntime.assertObject(require("../lib/scope.js")).Scope;
var throwError = (function() {
  throw 'Error';
});
var noop = (function() {});
var increaseCounter = (function(newValue, oldValue, scope) {
  return scope.counter++;
});
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
      var listenerFn = spy();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn.callCount).to.equal(1);
    }));
    it("calls the watch function with the scope as the argument", (function() {
      var watchFn = spy();
      scope.$watch(watchFn, noop);
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
      scope.$watch(watchFn, increaseCounter);
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
      scope.$watch(watchFn, increaseCounter);
      scope.$digest();
      expect(scope.counter).to.equal(1);
    }));
    it("may have watchers that omit the listener function", (function() {
      var watchFn = stub().returns('something');
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
    it("ends the digest when the last watch is clean", (function() {
      scope.array = range(100);
      var watchExecutions = 0;
      times(100, (function(i) {
        scope.$watch((function(scope) {
          watchExecutions++;
          return scope.array[i];
        }), noop);
      }));
      scope.$digest();
      expect(watchExecutions).to.equal(200);
      scope.array[0] = 42;
      scope.$digest();
      expect(watchExecutions).to.equal(301);
    }));
    it("compares based on value if enabled", (function() {
      scope.aValue = [1, 2, 3];
      scope.counter = 0;
      var watchFn = (function(scope) {
        return scope.aValue;
      });
      scope.$watch(watchFn, increaseCounter, true);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.aValue.push(4);
      scope.$digest();
      expect(scope.counter).to.equal(2);
    }));
  }));
  describe("$eval", (function() {
    it("executes $eval'ed function and returns result", (function() {
      scope.aValue = 42;
      var result = scope.$eval((function(scope) {
        return scope.aValue;
      }));
      expect(result).to.equal(42);
    }));
    it("passes the second $eval argument straight through", (function() {
      scope.aValue = 45;
      var result = scope.$eval((function(scope, foo, bar) {
        return scope.aValue + foo + bar;
      }), 2, 3);
      expect(result).to.equal(50);
    }));
  }));
  describe("$apply", (function() {
    it("executes $apply'ed function and starts the digest", (function() {
      scope.aValue = 'someValue';
      scope.counter = 0;
      var watchFn = (function(scope) {
        return scope.aValue;
      });
      scope.$watch(watchFn, increaseCounter);
      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.$apply((function(scope) {
        return scope.aValue = 'someOtherValue';
      }));
      expect(scope.counter).to.equal(2);
    }));
  }));
  describe("$evalAsync", (function() {
    it("executes $evalAsynced function later in the same cycle", (function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.asyncEvaluatedImmediately = false;
      scope.$watch((function(scope) {
        return scope.aValue;
      }), (function(newValue, oldValue, scope) {
        scope.$evalAsync((function(scope) {
          return scope.asyncEvaluated = true;
        }));
        scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
      }));
      scope.$digest();
      expect(scope.asyncEvaluated).to.equal(true);
      expect(scope.asyncEvaluatedImmediately).to.equal(false);
    }));
    it("executes $evalAsynced functions added by watch functions", (function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.$watch((function(scope) {
        if (!scope.asyncEvaluated) {
          scope.$evalAsync((function(scope) {
            return scope.asyncEvaluated = true;
          }));
        }
        return scope.aValue;
      }), (function(newValue, oldValue, scope) {}));
      scope.$digest();
      expect(scope.asyncEvaluated).to.equal(true);
    }));
    it("executes $evalAsynced functions even when not dirty", (function() {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluatedTimes = 0;
      scope.$watch((function(scope) {
        if (scope.asyncEvaluatedTimes < 2) {
          scope.$evalAsync((function(scope) {
            return scope.asyncEvaluatedTimes++;
          }));
        }
        return scope.aValue;
      }), noop);
      scope.$digest();
      expect(scope.asyncEvaluatedTimes).to.equal(2);
    }));
    it("eventually halts $evalAsyncs added by watches", (function() {
      scope.aValue = [1, 2, 3];
      scope.$watch((function(scope) {
        scope.$evalAsync(noop);
        return scope.aValue;
      }), noop);
      expect((function() {
        return scope.$digest();
      })).to.throw(/10 digest iterations reached/);
    }));
  }));
  describe("$$postDigest", (function() {
    it("has a $$phase field whose value is the current digest phase", (function() {
      scope.aValue = [1, 2, 3];
      scope.phaseInWatchFunction = undefined;
      scope.phaseInListenerFunction = undefined;
      scope.phaseInApplyFunction = undefined;
      var watchFn = (function(scope) {
        scope.phaseInWatchFunction = scope.$$phase;
        return scope.aValue;
      });
      var listener = (function(newValue, oldValue, scope) {
        return scope.phaseInListenerFunction = scope.$$phase;
      });
      scope.$watch(watchFn, listener);
      scope.$apply((function(scope) {
        return scope.phaseInApplyFunction = scope.$$phase;
      }));
      expect(scope.phaseInWatchFunction).to.be.equal('$digest');
      expect(scope.phaseInListenerFunction).to.be.equal('$digest');
      expect(scope.phaseInApplyFunction).to.be.equal('$apply');
    }));
    it("schedules a digest in $evalAsync", (function(done) {
      scope.aValue = "abc";
      scope.counter = 0;
      scope.$watch((function(scope) {
        return scope.aValue;
      }), (function() {
        return scope.counter++;
      }));
      scope.$evalAsync((function(scope) {}));
      expect(scope.counter).to.equal(0);
      setTimeout((function() {
        expect(scope.counter).to.equal(1);
        done();
      }), 4);
    }));
    it("runs a $$postDigest function after each digest", (function() {
      scope.counter = 0;
      scope.$$postDigest((function() {
        return scope.counter++;
      }));
      expect(scope.counter).to.be.equal(0);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
    }));
    it("does not include $$postDigest in the digest", (function() {
      scope.aValue = 'original value';
      scope.$$postDigest((function() {
        return scope.aValue = 'changed value';
      }));
      scope.$watch((function(scope) {
        return scope.aValue;
      }), (function(newValue, oldValue, scope) {
        return scope.watchedValue = newValue;
      }));
      scope.$digest();
      expect(scope.watchedValue).to.be.equal('original value');
      scope.$digest();
      expect(scope.watchedValue).to.be.equal('changed value');
    }));
  }));
  describe("exception handlers", (function() {
    it("catches exceptions in watch functions and continues", (function() {
      scope.aValue = 'abc';
      scope.counter = 0;
      scope.$watch(throwError, noop);
      scope.$watch((function(scope) {
        return scope.aValue;
      }), increaseCounter);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
    }));
    it("catches exceptions in listener functions and continues", function() {
      scope.aValue = 'abc';
      scope.counter = 0;
      scope.$watch(noop, throwError);
      scope.$watch(noop, increaseCounter);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
    });
    it("catches exceptions in $evalAsync", function(done) {
      scope.aValue = 'abc';
      scope.counter = 0;
      scope.$watch((function(scope) {
        return scope.aValue;
      }), increaseCounter);
      scope.$evalAsync(throwError);
      setTimeout(function() {
        expect(scope.counter).to.be.equal(1);
        done();
      }, 0);
    });
    it("catches exceptions in $$postDigest", function() {
      var didRun = false;
      scope.$$postDigest(throwError);
      scope.$$postDigest((function() {
        return didRun = true;
      }));
      scope.$digest();
      expect(didRun).to.be.equal(true);
    });
  }));
}));
