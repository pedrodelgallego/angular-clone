import {isEqual, cloneDeep } from "lodash"

// Functions are unique objects in JS this way new watches will always have
// their listener functions invoked, whatever their watch functions
// might return
var uniqueValue = () => { };

export class Scope {
  constructor(){
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
    this.$$asyncQueue = [];
  }

  $$areEqual(o1, o2, eq){
    if (eq) {
      return isEqual(o1, o2);
    } else {
      return o1 === o2 ||
        (typeof o1 === 'number' && typeof o2 === 'number' &&
         isNaN(o1) && isNaN(o2));
    }
  }

  $watch(watchExp, listener = () => {}, objectEquality) {
    this.$$watchers.push({
      watchExp,
      listener,
      last: uniqueValue,
      eq: !!objectEquality
    });

    this.$$lastDirtyWatch = null;
  }

  $$digestOnce(){
    var dirty, newValue;
    for (var watcher of this.$$watchers){
      newValue = watcher.watchExp(this);
      if (!this.$$areEqual(newValue, watcher.last, watcher.eq)) {
        this.$$lastDirtyWatch = watcher;

        // if the last value is equal to the uniqueValue, them we
        // should not leak the uniqueValue to the method, instead pass
        // the new value to the scope as the last iteration
        watcher.listener(newValue, (watcher.last === uniqueValue? newValue : watcher.last), this);

        watcher.last = (watcher.eq ? cloneDeep(newValue) : newValue);
        dirty = true;
      } else if (this.$$lastDirtyWatch === watcher) {
        break;
      }
    }
    return dirty;
  }

  $digest() {
    var dirty, count = 10;
    this.$$lastDirtyWatch = null;

    do {
      while (this.$$asyncQueue.length) {
        var asyncTask = this.$$asyncQueue.shift();
        asyncTask.scope.$eval(asyncTask.expression);
      }

      if(!count--){
        throw new Error("10 digest iterations reached");
      }

      dirty = this.$$digestOnce();
    } while(dirty);
  }

  $eval(fn, ...locals){
    return fn(this, ...locals)
  }

  $apply(expr) {
    try {
      return this.$eval(expr);
    } finally {
      this.$digest();
    }
  }

  $evalAsync(expr) {
    this.$$asyncQueue.push({scope: this, expression: expr});
  }
}
