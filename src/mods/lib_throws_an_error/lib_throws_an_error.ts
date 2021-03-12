// @ts-nocheck
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

export const libThrowsAnError = `
var throwsAnError = function(){
  var id = (()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16)))();
  const fn = ${throwAnError.toString()};
  Object.defineProperty(fn, id, { value: id });
  return fn;
};
var throws_an_error = throwsAnError;
`;
