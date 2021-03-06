"use strict";
Object.defineProperties(exports, {
  Scope: {get: function() {
      return Scope;
    }},
  __esModule: {value: true}
});
var __moduleName = "scope";
var cloneDeep = $traceurRuntime.assertObject(require("lodash")).cloneDeep;
var equals = $traceurRuntime.assertObject(require("./angular.js")).equals;
var uniqueValue = (function() {});
var Scope = function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
  this.$$asyncQueue = [];
  this.$$postDigestQueue = [];
  this.$$phase = null;
};
($traceurRuntime.createClass)(Scope, {
  $$areEqual: function(o1, o2, eq) {
    if (eq) {
      return equals(o1, o2);
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
        newValue,
        oldValue;
    for (var $__2 = this.$$watchers[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var watcher = $__3.value;
      {
        try {
          newValue = watcher.watchExp(this);
          if (!this.$$areEqual(newValue, watcher.last, watcher.eq)) {
            this.$$lastDirtyWatch = watcher;
            oldValue = (watcher.last === uniqueValue ? newValue : watcher.last);
            watcher.listener(newValue, oldValue, this);
            watcher.last = (watcher.eq ? cloneDeep(newValue) : newValue);
            dirty = true;
          } else if (this.$$lastDirtyWatch === watcher) {
            break;
          }
        } catch (e) {}
      }
    }
    return dirty;
  },
  $digest: function() {
    var dirty,
        count = 10;
    this.$$lastDirtyWatch = null;
    this.$beginPhase("$digest");
    do {
      while (this.$$asyncQueue.length) {
        try {
          var asyncTask = this.$$asyncQueue.shift();
          asyncTask.scope.$eval(asyncTask.expression);
        } catch (e) {}
      }
      dirty = this.$$digestOnce();
      if ((dirty || this.$$asyncQueue.length) && !(count--)) {
        throw new Error("10 digest iterations reached");
      }
    } while (dirty || this.$$asyncQueue.length);
    for (var $__2 = this.$$postDigestQueue[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var fn = $__3.value;
      {
        try {
          fn();
        } catch (e) {}
      }
    }
    this.$$postDigestQueue = [];
    this.$clearPhase();
  },
  $eval: function(fn) {
    for (var locals = [],
        $__4 = 1; $__4 < arguments.length; $__4++)
      locals[$__4 - 1] = arguments[$__4];
    return fn.apply(null, $traceurRuntime.spread([this], locals));
  },
  $apply: function(expr) {
    try {
      this.$beginPhase("$apply");
      return this.$eval(expr);
    } finally {
      this.$clearPhase();
      this.$digest();
    }
  },
  $evalAsync: function(expr) {
    var $__0 = this;
    if (!this.$$phase && !this.$$asyncQueue.length) {
      setTimeout((function() {
        if ($__0.$$asyncQueue.length) {
          $__0.$digest();
        }
      }), 0);
    }
    this.$$asyncQueue.push({
      scope: this,
      expression: expr
    });
  },
  $$postDigest: function(fn) {
    this.$$postDigestQueue.push(fn);
  },
  $beginPhase: function(phase) {
    if (this.$$phase) {
      throw this.$$phase + ' already in progress.';
    }
    this.$$phase = phase;
  },
  $clearPhase: function(phase) {
    this.$$phase = null;
  }
}, {});
