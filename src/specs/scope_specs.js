import {expect} from "chai"
import {range, times} from "lodash"
import {stub, spy} from "sinon"
import {Scope} from "../lib/scope.js"

var throwError = () => {throw 'Error'};

var noop = () => { };

var increaseCounter = (newValue, oldValue, scope) => scope.counter++

describe("Scope", () => {
  var scope;
  beforeEach(() => { scope = new Scope(); });

  it("can be constructed and used as an object", () => {
    scope.aProperty = 1;
    expect(scope.aProperty).to.equal(1);
  });

  describe("digest", () => {
    it("calls the listener function of a watch on first $digest", () => {
      var watchFn = () => 'wat';
      var listenerFn = spy();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn.callCount).to.equal(1);
    });

    it("calls the watch function with the scope as the argument", () => {
      var watchFn = spy();
      scope.$watch(watchFn, noop);
      scope.$digest();
      expect(watchFn.calledWith(scope)).to.equal(true);
    });

    it("calls the listener function when the watched value changes", () => {
      scope.someValue = 'a';
      scope.counter = 0;
      expect(scope.counter).to.equal(0);

      var watchFn  = scope => scope.someValue;
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
      scope.$watch(watchFn, increaseCounter);
      scope.$digest();
      expect(scope.counter).to.equal(1);
    });

    it("may have watchers that omit the listener function", () => {
      var watchFn = stub().returns('something');
      scope.$watch(watchFn);
      scope.$digest();
      expect(watchFn.callCount).to.not.equal(0);
    });

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

    it("gives up on the watches after 10 iterations", () => {
      scope.counterA = 0;
      scope.counterB = 0;
      scope.$watch(
        (scope) => { return scope.counterA; },
        (newValue, oldValue, scope) => {scope.counterB++;}
      );
      scope.$watch(
        (scope) => { return scope.counterB; },
        (newValue, oldValue, scope) => { scope.counterA++;}
      );
      expect((() => { scope.$digest(); })).to.throw(/10 digest iterations reached/);
    });

    it("ends the digest when the last watch is clean", () => {
      scope.array = range(100);
      var watchExecutions = 0;

      times(100, (i) => {
        scope.$watch(
          (scope) => {
            watchExecutions++;
            return scope.array[i];
          },
          noop
        );
      });

      scope.$digest();
      expect(watchExecutions).to.equal(200);
      scope.array[0] = 42;
      scope.$digest();
      expect(watchExecutions).to.equal(301);
    });

    it("compares based on value if enabled", () => {
      scope.aValue = [1, 2, 3];
      scope.counter = 0;
      var watchFn = scope => scope.aValue;
      scope.$watch(watchFn, increaseCounter, true);

      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.aValue.push(4);
      scope.$digest();
      expect(scope.counter).to.equal(2);
    });
  });

  describe("$eval", ()=>{
    it("executes $eval'ed function and returns result", () => {
      scope.aValue = 42;

      var result = scope.$eval(scope => scope.aValue);
      expect(result).to.equal(42);
    });

    it("passes the second $eval argument straight through", () => {
      scope.aValue = 45;
      var result = scope.$eval((scope, foo, bar) => scope.aValue + foo + bar, 2, 3);
      expect(result).to.equal(50);
    });
  });

  describe("$apply", () => {
    it("executes $apply'ed function and starts the digest", () => {
      scope.aValue = 'someValue';
      scope.counter = 0;
      var watchFn = scope => scope.aValue;
      scope.$watch(watchFn, increaseCounter);

      scope.$digest();
      expect(scope.counter).to.equal(1);
      scope.$apply(scope => scope.aValue = 'someOtherValue');
      expect(scope.counter).to.equal(2);
    });
  });

  describe("$evalAsync", () => {
    it("executes $evalAsynced function later in the same cycle", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.asyncEvaluatedImmediately = false;

      scope.$watch(
        (scope) => scope.aValue,
        (newValue, oldValue, scope) => {
          scope.$evalAsync(scope => scope.asyncEvaluated = true);
          scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
        }
      );

      scope.$digest();
      expect(scope.asyncEvaluated).to.equal(true);
      expect(scope.asyncEvaluatedImmediately).to.equal(false);
    });

    it("executes $evalAsynced functions added by watch functions", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.$watch(
        (scope) => {
          if (!scope.asyncEvaluated) {
            scope.$evalAsync((scope) => scope.asyncEvaluated = true);
          }
          return scope.aValue;
        },
        (newValue, oldValue, scope) => { }
      );
      scope.$digest();
      expect(scope.asyncEvaluated).to.equal(true);
    });

    it("executes $evalAsynced functions even when not dirty", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluatedTimes = 0;
      scope.$watch(
        (scope) => {
          if (scope.asyncEvaluatedTimes < 2) {
            scope.$evalAsync((scope) => scope.asyncEvaluatedTimes++);
          }
          return scope.aValue;
        },
        noop
      );
      scope.$digest();
      expect(scope.asyncEvaluatedTimes).to.equal(2);
    });

    it("eventually halts $evalAsyncs added by watches", () => {
      scope.aValue = [1, 2, 3];
      scope.$watch(
        (scope) => {
          scope.$evalAsync(noop);
          return scope.aValue;
        },
        noop
      );
      expect(() => scope.$digest() ).to.throw(/10 digest iterations reached/);
    });
  });

  describe("$$postDigest", () => {
    it("has a $$phase field whose value is the current digest phase", () => {
      scope.aValue = [1, 2, 3];
      scope.phaseInWatchFunction = undefined;
      scope.phaseInListenerFunction = undefined;
      scope.phaseInApplyFunction = undefined;
      var watchFn = (scope) => {
        scope.phaseInWatchFunction = scope.$$phase;
        return scope.aValue;
      };
      var listener = (newValue, oldValue, scope) => scope.phaseInListenerFunction = scope.$$phase

      scope.$watch(watchFn, listener);
      scope.$apply((scope) => scope.phaseInApplyFunction = scope.$$phase);
      expect(scope.phaseInWatchFunction).to.be.equal('$digest');
      expect(scope.phaseInListenerFunction).to.be.equal('$digest');
      expect(scope.phaseInApplyFunction).to.be.equal('$apply');
    });

    it("schedules a digest in $evalAsync", (done) => {
      scope.aValue = "abc";
      scope.counter = 0;
      scope.$watch((scope) => scope.aValue, () => scope.counter++);

      scope.$evalAsync((scope) => {});
      expect(scope.counter).to.equal(0);

      setTimeout(() => {
        expect(scope.counter).to.equal(1);
        done();
      }, 4);
    });

    it("runs a $$postDigest function after each digest", () => {
      scope.counter = 0;
      scope.$$postDigest(() => scope.counter++);
      expect(scope.counter).to.be.equal(0);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
    });

    it("does not include $$postDigest in the digest", () => {
      scope.aValue = 'original value';
      scope.$$postDigest(() =>  scope.aValue = 'changed value');
      scope.$watch(
        (scope) => scope.aValue,
        (newValue, oldValue, scope) => scope.watchedValue = newValue
      );
      scope.$digest();
      expect(scope.watchedValue).to.be.equal('original value');
      scope.$digest();
      expect(scope.watchedValue).to.be.equal('changed value');
    });
  });

  describe("exception handlers", () => {
    it("catches exceptions in watch functions and continues", () => {
      scope.aValue = 'abc';
      scope.counter = 0;
      scope.$watch(throwError , noop);
      scope.$watch((scope) => scope.aValue, increaseCounter);
      scope.$digest();
      expect(scope.counter).to.be.equal(1);
    });

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

      scope.$watch((scope) => scope.aValue , increaseCounter);

      scope.$evalAsync(throwError);

      setTimeout(function() {
        expect(scope.counter).to.be.equal(1);
        done();
      }, 0);
    });

    it("catches exceptions in $$postDigest", function() {
      var didRun = false;
      scope.$$postDigest(throwError);
      scope.$$postDigest(() => didRun = true);
      scope.$digest();
      expect(didRun).to.be.equal(true);
    });
  })
});
