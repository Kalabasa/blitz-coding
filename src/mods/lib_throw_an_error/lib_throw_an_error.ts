let id: string;

const throwAnError = function () {
  var error = new Error();

  // @ts-ignore
  var dis = this;

  var ctor = dis.constructor;
  var proto = Object.getPrototypeOf(dis) || (ctor && ctor.protoype);

  if (proto) {
    var calleeName =
      (ctor && ctor.name) || (proto.constructor && proto.constructor.name);
    var calleeMethod;

    var methods = Object.getOwnPropertyNames(proto);
    for (var i = 0; i < methods.length; i++) {
      var method = methods[i];
      if (proto[method][id]) {
        calleeMethod = method;
        break;
      }
    }

    if (calleeName && calleeMethod) {
      error.message =
        "The " + calleeName + " " + calleeMethod + "() method is not allowed!";
    } else if (calleeName) {
      error.message =
        "Some " + calleeName + " method you’re using has been banned!";
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

export const libThrowAnError = `
var throwAnError = function(){
  var id = (()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16)))();
  const fn = ${throwAnError.toString()};
  fn[id] = true;
  return fn;
};
`;
