import { cloneDeep } from "lodash"
import { equals } from "./angular.js"


// Functions are unique objects in JS this way new watches will always have
// their listener functions invoked, whatever their watch functions
// might return
var uniqueValue = () => { };

export class Scope {
  constructor(){
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
    this.$$asyncQueue = [];
    this.$$postDigestQueue = [];
    this.$$phase = null;
  }

  $$areEqual(o1, o2, eq){
    if (eq) {
      return equals(o1, o2);
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
    var dirty, newValue, oldValue;
    for (var watcher of this.$$watchers){
      try {
        newValue = watcher.watchExp(this);
        if (!this.$$areEqual(newValue, watcher.last, watcher.eq)) {
          this.$$lastDirtyWatch = watcher;

          // if the last value is equal to the uniqueValue, them we
          // should not leak the uniqueValue to the method, instead pass
          // the new value to the scope as the last iteration
          oldValue = (watcher.last === uniqueValue? newValue : watcher.last);
          watcher.listener(newValue, oldValue, this);

          watcher.last = (watcher.eq ? cloneDeep(newValue) : newValue);
          dirty = true;
        } else if (this.$$lastDirtyWatch === watcher) {
          break;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return dirty;
  }

  $digest() {
    var dirty, count = 10;
    this.$$lastDirtyWatch = null;
    this.$beginPhase("$digest");

    do {
      while (this.$$asyncQueue.length) {
        var asyncTask = this.$$asyncQueue.shift();
        asyncTask.scope.$eval(asyncTask.expression);
      }

      dirty = this.$$digestOnce();

      if ((dirty || this.$$asyncQueue.length) && !(count--)) {
        throw new Error("10 digest iterations reached");
      }
    } while(dirty || this.$$asyncQueue.length);

    for (var fn of this.$$postDigestQueue){
      fn();
    }

    this.$$postDigestQueue = [];

    this.$clearPhase();
  }

  $eval(fn, ...locals){
    return fn(this, ...locals)
  }

  $apply(expr) {
    try {
      this.$beginPhase("$apply");
      return this.$eval(expr);
    } finally {
      this.$clearPhase();
      this.$digest();
    }
  }

  $evalAsync(expr) {
    if (!this.$$phase && !this.$$asyncQueue.length) {
      setTimeout(() => {
        if (this.$$asyncQueue.length) {
          this.$digest();
        }
      }, 0);
    }
    this.$$asyncQueue.push({scope: this, expression: expr});
  }

  $$postDigest(fn){
    this.$$postDigestQueue.push(fn);
  }

  $beginPhase(phase){
    if(this.$$phase){
      throw this.$$phase + ' already in progress.';
    }
    this.$$phase = phase;
  }

  $clearPhase(phase){
    this.$$phase = null;
  }
}
