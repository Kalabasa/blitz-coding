// @ts-nocheck

/* eslint-disable */
let id: string;

const throwAnError = function () {
  var error = new Error();

  var ctor = this.constructor;
  var proto = Object.getPrototypeOf(this) || (ctor && ctor.protoype);

  if (proto) {
    var calleeName =
      (ctor && ctor.name) || (proto.constructor && proto.constructor.name);
    var calleeMethod;

    var methods = Object.getOwnPropertyNames(proto);
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      if (proto[method] && proto[method][id]) {
        calleeMethod = method;
        break;
      }
    }

    if (!calleeMethod) {
      var globalObjects = ["Number", "Math", "Object", "Array", "JSON"];
      loop: for (var i = 0; i < globalObjects.length; i++) {
        var obj = window[globalObjects[i]];
        var methods = Object.getOwnPropertyNames(obj);
        for (var j = 0; j < methods.length; j++) {
          var method = methods[j];
          if (obj[method] && obj[method][id]) {
            calleeName = globalObjects[i];
            calleeMethod = method;
            break loop;
          }
        }
      }
    }

    if (calleeName && calleeMethod) {
      error.message =
        "The " + calleeName + " " + calleeMethod + "() method is not allowed!";
    } else if (calleeName) {
      error.message = "Some method you’re using has been banned!";
    } else if (calleeMethod) {
      error.message = "The " + calleeMethod + "() method is not allowed!";
    } else {
      error.message = "An error was thrown by a Modifier!";
    }
  } else {
    error.message = "An error was thrown by a Modifier!";
  }

  throw error;
};
/* eslint-enable */

export const libThrowsAnError = `
var throws_an_error = (function(){
  var count = 0;
  return function(){
    var id = "throws_an_error_" + count++;
    const fn = ${throwAnError.toString()};
    Object.defineProperty(fn, id, { value: id });
    return fn;
  };
})();
`;
