"use strict";
Object.defineProperties(exports, {
  Scope: {get: function() {
      return Scope;
    }},
  __esModule: {value: true}
});
var __moduleName = "scope";
var $__4 = $traceurRuntime.assertObject(require("lodash")),
    isEqual = $__4.isEqual,
    cloneDeep = $__4.cloneDeep;
var uniqueValue = (function() {});
var Scope = function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
};
($traceurRuntime.createClass)(Scope, {
  $$areEqual: function(o1, o2, eq) {
    if (eq) {
      return isEqual(o1, o2);
    } else {
      return o1 === o2 || (typeof o1 === 'number' && typeof o2 === 'number' && isNaN(o1) && isNaN(o2));
    }
  },
  $watch: function(watchExp) {
    var listener = arguments[1] !== (void 0) ? arguments[1] : (function() {});
    var objectEquality = arguments[2];
    this.$$watchers.push({
      watchExp: watchExp,
      listener: listener,
      last: uniqueValue,
      eq: !!objectEquality
    });
    this.$$lastDirtyWatch = null;
  },
  $$digestOnce: function() {
    var dirty,
        newValue;
    for (var $__1 = this.$$watchers[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var watcher = $__2.value;
      {
        newValue = watcher.watchExp(this);
        if (!this.$$areEqual(newValue, watcher.last, watcher.eq)) {
          this.$$lastDirtyWatch = watcher;
          watcher.listener(newValue, (watcher.last === uniqueValue ? newValue : watcher.last), this);
          watcher.last = (watcher.eq ? cloneDeep(newValue) : newValue);
          dirty = true;
        } else if (this.$$lastDirtyWatch === watcher) {
          break;
        }
      }
    }
    return dirty;
  },
  $digest: function() {
    var dirty,
        count = 10;
    this.$$lastDirtyWatch = null;
    do {
      if (!count--) {
        throw new Error("10 digest iterations reached");
      }
      dirty = this.$$digestOnce();
    } while (dirty);
  },
  $eval: function(fn) {
    for (var locals = [],
        $__3 = 1; $__3 < arguments.length; $__3++)
      locals[$__3 - 1] = arguments[$__3];
    return fn.apply(null, $traceurRuntime.spread([this], locals));
  }
}, {});
