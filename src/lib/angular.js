import {setupModuleLoader} from "./loader.js"

var isFunction = (fn) => typeof fn === "function";
var isArray = (array) => Object.prototype.toString.call(array) === '[object Array]';
var isString = (obj)  => typeof obj === "string";

if (require) {
  global.window = {}
}

var compareArrays = (a1, a2) => {
  var length, key;
  if (!isArray(a1) || !isArray(a2)) return false;
  if ((length = a1.length) == a2.length) {
    for(key=0; key<length; key++) {
      if (!equals(a1[key], a2[key])) return false;
    }
    return true;
  }
  return false;
};

var equals = (o1, o2) => {
  var t1 = typeof o1,
      t2 = typeof o2,
      key,
      keySet;

  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
  if (t1 !== t2) return false;

  if (isArray(o1) || isArray(o2)) {
    return compareArrays(o1, o2);
  }

  if (t1 == 'object') {
    keySet = {};
    for(key in o1) {
      if (isFunction(o1[key])) continue;
      if (!equals(o1[key], o2[key])) return false;
      keySet[key] = true;
    }

    for(key in o2) {
      if (!keySet.hasOwnProperty(key) &&
          o2[key] !== undefined &&
          !isFunction(o2[key])) return false;
    }

    return true;
  }

  return false;
};


export {
  equals,
  isString
}
