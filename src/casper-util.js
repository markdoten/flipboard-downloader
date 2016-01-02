var util = module.exports = {};

util.pageError = function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
};

util.remoteMessage = function(msg) {
  // if (msg.indexOf('displayed insecure content') > -1) {
  //   return;
  // }
  this.echo('remote message caught: ' + msg);
};

util.shim = function() {
  this.evaluate(function() {
    var isFunction = function(o) {
      return typeof o == 'function';
    };

    var bind,
      slice = [].slice,
      proto = Function.prototype,
      featureMap,
      requestAnimationFrame;

    featureMap = {
      'function-bind': 'bind',
      'function-requestAnimationFrame': 'requestAnimationFrame'
    };

    function has(feature) {
      var prop = featureMap[feature];
      return isFunction(proto[prop]);
    }

    // check for missing features
    if (!has('function-bind')) {
      // adapted from Mozilla Developer Network example at
      // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
      bind = function bind(obj) {
        var args = slice.call(arguments, 1),
          self = this,
          nop = function() {
          },
          bound = function() {
            return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
          };
        nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
        bound.prototype = new nop();
        return bound;
      };
      proto.bind = bind;
    }

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
  });
};
