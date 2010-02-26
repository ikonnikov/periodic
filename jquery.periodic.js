/*!
 * jQuery periodic plugin
 *
 * Copyright 2010, Tom Anderson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

jQuery.periodic = function (options, callback) {

  // if the first argument is a function then assume the options aren't being passed
  if (jQuery.isFunction(options)) {
    callback = options;
    options = {};
  }

  // Merge passed settings with default values
  var settings = jQuery.extend({}, jQuery.periodic.defaults, {
    ajax_complete : ajaxComplete,
    increment     : increment,
    reset         : reset
  }, options);

  // bookkeeping variables
  settings.cur_period = settings.period;
  var prev_ajax_response = '';

  run();

  // return settings so user can tweak them externally
  return settings;

  function run() {
    setTimeout(function() {
      // set the context (this) for the callback to the settings object
      callback.call(settings);

      // compute the next value for cur_period
      increment();
      
      // queue up the next run
      run();
    }, settings.cur_period);
  }

  // compute the next delay
  function increment() {
    settings.cur_period *= settings.decay
    if (settings.cur_period < settings.period) {
      // don't let it drop below the minimum
      reset();
    } else if (settings.cur_period > settings.max_period) {
      settings.cur_period = settings.max_period
      if (settings.on_max !== undefined) {
        // call the user-supplied callback if we reach max_period
        settings.on_max.call(settings);
      }
    }
  }

  function reset() {
    settings.cur_period = settings.period;
  }

  // convenience function for use with ajax calls
  function ajaxComplete(xhr, status) {
    if (status === 'success' && prev_ajax_response !== xhr.responseText) {
      // go back to the period whenver the response changes
      prev_ajax_response = xhr.responseText;
      reset();
    }
  }
  
  // other functions we might want to implement
  function pause() {}
  function resume() {}
  function log() {}
};

jQuery.periodic.defaults = {
    period       : 4000,      // 4 sec.
    max_period   : 1800000,   // 30 min.
    decay        : 1.5,       // time period multiplier
    on_max       : undefined  // called if max_period is reached
}
