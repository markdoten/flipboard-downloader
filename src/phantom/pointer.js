module.exports = (function () {
  var hasTouch = 'ontouchstart' in window,
      startEvent = hasTouch ? 'touchstart' : 'mousedown',
      stopEvent = hasTouch ? 'touchend' : 'mouseup',
      moveEvent = hasTouch ? 'touchmove' : 'mousemove';

  return {
    x: 0,
    y: 0,

    trigger: function (evtName) {
      var $el = $(document.elementFromPoint(this.x, this.y));
      $el.trigger(new $.Event(evtName, {
        pageX: this.x,
        pageY: this.y,
        originalEvent: {
          touches: [{
            pageX: this.x,
            pageY: this.y
          }]
        }
      }));
    },

    click: function () {
      this.trigger('click');
    },

    tapStart: function () {
      this.trigger(startEvent);
    },

    tapEnd: function () {
      this.trigger(stopEvent);
    },

    move: function (x, y, callback, duration) {
      var self = this,
          last = Date.now(),
          t = 0,
          timer;

      this.tapStart();

      var sx = this.x,
          sy = this.y;
      (function mv() {
        var now = Date.now();
        t += now - last;
        if (t >= duration) {
          self.tapEnd();
          callback.call(self);
          return;
        }
        last = now;

        self.x = Math.ceil(t / duration * x) + sx;
        self.y = Math.ceil(t / duration * y) + sy;

        self.trigger(moveEvent);
        timer = setTimeout(mv, 0);
      })();
    },

    tap: function () {
      this.tapStart();
      this.tapEnd();
    },

    press: function (callback, duration) {
      var self = this;
      duration = duration || this.PRESS_DURATION * 1.5 /* security */;
      this.tapStart();
      setTimeout(function () {
        self.tapEnd();
        if (callback) callback.call(self);
      }, duration);
    },

    doubleTap: function (callback, duration) {
      var self = this;
      duration = duration || this.DOUBLETAP_DURATION * 0.5 /* security */;
      this.tap();
      setTimeout(function () {
        self.tap();
        callback.call(self);
      }, duration);
    },

    drag: function (x, y, callback, duration) {
      duration = duration || this.FLICK_DURATION * 1.5 /* security */;
      this.move(x, y, callback, duration);
    },

    flick: function (x, y, callback, duration) {
      duration = duration || this.FLICK_DURATION * 0.5 /* security */;
      this.move(x, y, callback, duration);
    },

    START_EVENT: startEvent,
    STOP_EVENT: stopEvent,
    MOVE_EVENT: moveEvent,

    PRESS_DURATION: 300,
    DOUBLETAP_DURATION: 300,
    FLICK_DURATION: 300
  };
}());
