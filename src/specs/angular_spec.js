import {expect} from "chai"
import {equals, isString, isArray, isFunction} from "../lib/angular.js"

describe('equals', function() {
  it('should return true if same object', function() {
    var o = {};
    expect(equals(o, o)).to.be.equal(true);
    expect(equals(o, {})).to.be.equal(true);
    expect(equals(1, '1')).to.be.equal(false);
    expect(equals(1, '2')).to.be.equal(false);
  });

  it('should recurse into object', function() {
    expect(equals({}, {})).to.be.equal(true);
    expect(equals({name:'misko'}, {name:'misko'})).to.be.equal(true);
    expect(equals({name:'misko', age:1}, {name:'misko'})).to.be.equal(false);
    expect(equals({name:'misko'}, {name:'misko', age:1})).to.be.equal(false);
    expect(equals({name:'misko'}, {name:'adam'})).to.be.equal(false);
    expect(equals(['misko'], ['misko'])).to.be.equal(true);
    expect(equals(['misko'], ['adam'])).to.be.equal(false);
    expect(equals(['misko'], ['misko', 'adam'])).to.be.equal(false);
  });

  it('should ignore undefined member variables during comparison', function() {
    var obj1 = {name: 'misko'},
    obj2 = {name: 'misko', undefinedvar: undefined};

    expect(equals(obj1, obj2)).to.equal(true);
    expect(equals(obj2, obj1)).to.equal(true);
  });

  it('should ignore functions', function() {
    expect(equals({func: function() {}}, {bar: function() {}})).to.be.equal(true);
  });

  it('should work well with nulls', function() {
    expect(equals(null, '123')).to.equal(false);
    expect(equals('123', null)).to.equal(false);
    expect(equals(null, null)).to.equal(true);

    var obj = {foo:'bar'};
    expect(equals(null, obj)).to.equal(false);
    expect(equals(obj, null)).to.equal(false);
  });

  it('should work well with undefined', function() {
    expect(equals(undefined, '123')).to.equal(false);
    expect(equals('123', undefined)).to.equal(false);

    var obj = {foo:'bar'};
    expect(equals(undefined, obj)).to.equal(false);
    expect(equals(obj, undefined)).to.equal(false);

    expect(equals(undefined, undefined)).to.equal(true);
  });

  it('should treat two NaNs as equal', function() {
    expect(equals(NaN, NaN)).to.equal(true);
  });

  it('should correctly test for keys that are present on Object.prototype', function() {
    expect(equals({}, {hasOwnProperty: 1})).to.equal(false);
    expect(equals({}, {toString: null})).to.equal(false);
  });

  it('should return false when comparing an object and an array', function() {
    expect(equals({}, [])).to.equal(false);
    expect(equals([], {})).to.equal(false);
  });
})


describe("isString", () => {
  it('should return false when comparing an object and an array', function() {
    expect(isString({})).to.equal(false);
    expect(isString([])).to.equal(false);
    expect(isString(1)).to.equal(false);
    expect(isString(2)).to.equal(false);
    expect(isString(undefined)).to.equal(false);
    expect(isString(null)).to.equal(false);

    expect(isString("")).to.equal(true);
    expect(isString("foo")).to.equal(true);
  });
});

describe("isArray", () => {
  it('should return false when comparing an object and an array', function() {
    expect(isArray({})).to.equal(false);
    expect(isArray(1)).to.equal(false);
    expect(isArray(2)).to.equal(false);
    expect(isArray(undefined)).to.equal(false);
    expect(isArray(null)).to.equal(false);
    expect(isArray("")).to.equal(false);
    expect(isArray("foo")).to.equal(false);

    expect(isArray([])).to.equal(true);
  });
});

describe("isFunction", () => {
  it('should identify a function', function() {
    expect(isFunction({})).to.equal(false);
    expect(isFunction(1)).to.equal(false);
    expect(isFunction(2)).to.equal(false);
    expect(isFunction(undefined)).to.equal(false);
    expect(isFunction(null)).to.equal(false);
    expect(isFunction("")).to.equal(false);
    expect(isFunction("foo")).to.equal(false);

    expect(isFunction(() => {})).to.equal(true);
  });
});
