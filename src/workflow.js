/**
 * Workflow class.
 * @constructor
 * @param {Webpage} page
 */
function Workflow(page) {
  /**
   * Whether a page load is in progress.
   * @type {boolean}
   * @private
   */
  this._loadInProgress = false;

  /**
   * Phantomjs Webpage instance.
   * @type {Webpage}
   * @private
   */
  this._page = page;

  /**
   * The steps to process during this workflow.
   * @type {Array.<Object>}
   * @private
   */
  this._steps = [];

  /**
   * Whether a step is in progress.
   * @type {boolean}
   * @private
   */
  this._stepInProgress = false;

  this._initializePageHandlers();
}

/**
 * Add a step to the workflow.
 * @param {string} title - Title of the step.
 * @param {function()} callback - The step function to call.
 */
Workflow.prototype.addStep = function (title, callback) {
  if (callback.toString().indexOf('(done)') === -1) {
    var oldCallback = callback;
    callback = function (done) {
      oldCallback();
      done();
    };
  }
  this._steps.push({
    callback: callback,
    title: title
  });
};

/**
 * Initialize the page event handlers.
 * @private
 */
Workflow.prototype._initializePageHandlers = function () {
  var self = this;

  if (!this._page) {
    return;
  }

  var page = this._page;

  page.onConsoleMessage = function (msg) {
    // console.log(msg);
  };

  page.onInitialized = function () {
    page.injectJs('node_modules/es5-shim/es5-shim.js');
    page.injectJs('node_modules/babel-polyfill/dist/polyfill.min.js');
  };

  page.onLoadStarted = function () {
    self._loadInProgress = true;
    console.log('load started');
  };

  page.onLoadFinished = function () {
    self._loadInProgress = false;
    console.log('load finished');
  };
};

/**
 * Kick off the workflow.
 */
Workflow.prototype.process = function (done) {
  var idx = 0;
  var self = this;

  var interval = setInterval(function () {
    if (self._loadInProgress || self._stepInProgress) {
      return;
    }

    var step = self._steps[idx];

    if (step && typeof step.callback === 'function') {
      console.log((idx + 1) + ': ' + step.title);
      self._stepInProgress = true;
      step.callback(function () {
        self._stepInProgress = false;
      });
      idx++;
      return;
    }
    clearInterval(interval);
    done();
  }, 50);
};

/**
 * Set the webpage on the workflow.
 * @param {Webpage} page
 */
Workflow.prototype.setPage = function(page) {
  this._page = page;
  this._initializePageHandlers();
};

module.exports = Workflow;
