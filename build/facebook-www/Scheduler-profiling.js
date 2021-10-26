/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @nolint
 * @preventMunge
 * @preserve-invariant-messages
 */

"use strict";
var _require = require("SchedulerFeatureFlags"),
  enableIsInputPending = _require.enableIsInputPending,
  enableSchedulerDebugging = _require.enableSchedulerDebugging,
  enableProfilingFeatureFlag = _require.enableProfiling,
  requestHostCallback,
  requestHostTimeout,
  cancelHostTimeout,
  requestPaint;
if ("object" === typeof performance && "function" === typeof performance.now) {
  var localPerformance = performance;
  exports.unstable_now = function() {
    return localPerformance.now();
  };
} else {
  var localDate = Date,
    initialTime = localDate.now();
  exports.unstable_now = function() {
    return localDate.now() - initialTime;
  };
}
if ("undefined" === typeof window || "function" !== typeof MessageChannel) {
  var _callback = null,
    _timeoutID = null,
    _flushCallback = function() {
      if (null !== _callback)
        try {
          var currentTime = exports.unstable_now();
          _callback(!0, currentTime);
          _callback = null;
        } catch (e) {
          throw (setTimeout(_flushCallback, 0), e);
        }
    };
  requestHostCallback = function(cb) {
    null !== _callback
      ? setTimeout(requestHostCallback, 0, cb)
      : ((_callback = cb), setTimeout(_flushCallback, 0));
  };
  requestHostTimeout = function(cb, ms) {
    _timeoutID = setTimeout(cb, ms);
  };
  cancelHostTimeout = function() {
    clearTimeout(_timeoutID);
  };
  exports.unstable_shouldYield = function() {
    return !1;
  };
  requestPaint = exports.unstable_forceFrameRate = function() {};
} else {
  var setTimeout$0 = window.setTimeout,
    clearTimeout$1 = window.clearTimeout;
  if ("undefined" !== typeof console) {
    var cancelAnimationFrame = window.cancelAnimationFrame;
    "function" !== typeof window.requestAnimationFrame &&
      console.error(
        "This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
      );
    "function" !== typeof cancelAnimationFrame &&
      console.error(
        "This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"
      );
  }
  var isMessageLoopRunning = !1,
    scheduledHostCallback = null,
    taskTimeoutID = -1,
    yieldInterval = 5,
    deadline = 0,
    needsPaint = !1;
  if (
    enableIsInputPending &&
    void 0 !== navigator &&
    void 0 !== navigator.scheduling &&
    void 0 !== navigator.scheduling.isInputPending
  ) {
    var scheduling = navigator.scheduling;
    exports.unstable_shouldYield = function() {
      var currentTime = exports.unstable_now();
      return currentTime >= deadline
        ? needsPaint || scheduling.isInputPending()
          ? !0
          : 300 <= currentTime
        : !1;
    };
    requestPaint = function() {
      needsPaint = !0;
    };
  } else
    (exports.unstable_shouldYield = function() {
      return exports.unstable_now() >= deadline;
    }),
      (requestPaint = function() {});
  exports.unstable_forceFrameRate = function(fps) {
    0 > fps || 125 < fps
      ? console.error(
          "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
        )
      : (yieldInterval = 0 < fps ? Math.floor(1e3 / fps) : 5);
  };
  var channel = new MessageChannel(),
    port = channel.port2;
  channel.port1.onmessage = function() {
    if (null !== scheduledHostCallback) {
      var currentTime = exports.unstable_now();
      deadline = currentTime + yieldInterval;
      try {
        scheduledHostCallback(!0, currentTime)
          ? port.postMessage(null)
          : ((isMessageLoopRunning = !1), (scheduledHostCallback = null));
      } catch (error) {
        throw (port.postMessage(null), error);
      }
    } else isMessageLoopRunning = !1;
    needsPaint = !1;
  };
  requestHostCallback = function(callback) {
    scheduledHostCallback = callback;
    isMessageLoopRunning ||
      ((isMessageLoopRunning = !0), port.postMessage(null));
  };
  requestHostTimeout = function(callback, ms) {
    taskTimeoutID = setTimeout$0(function() {
      callback(exports.unstable_now());
    }, ms);
  };
  cancelHostTimeout = function() {
    clearTimeout$1(taskTimeoutID);
    taskTimeoutID = -1;
  };
}
function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  a: for (;;) {
    var parentIndex = (index - 1) >>> 1,
      parent = heap[parentIndex];
    if (void 0 !== parent && 0 < compare(parent, node))
      (heap[parentIndex] = node), (heap[index] = parent), (index = parentIndex);
    else break a;
  }
}
function peek(heap) {
  heap = heap[0];
  return void 0 === heap ? null : heap;
}
function pop(heap) {
  var first = heap[0];
  if (void 0 !== first) {
    var last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      a: for (var index = 0, length = heap.length; index < length; ) {
        var leftIndex = 2 * (index + 1) - 1,
          left = heap[leftIndex],
          rightIndex = leftIndex + 1,
          right = heap[rightIndex];
        if (void 0 !== left && 0 > compare(left, last))
          void 0 !== right && 0 > compare(right, left)
            ? ((heap[index] = right),
              (heap[rightIndex] = last),
              (index = rightIndex))
            : ((heap[index] = left),
              (heap[leftIndex] = last),
              (index = leftIndex));
        else if (void 0 !== right && 0 > compare(right, last))
          (heap[index] = right),
            (heap[rightIndex] = last),
            (index = rightIndex);
        else break a;
      }
    }
    return first;
  }
  return null;
}
function compare(a, b) {
  var diff = a.sortIndex - b.sortIndex;
  return 0 !== diff ? diff : a.id - b.id;
}
var runIdCounter = 0,
  mainThreadIdCounter = 0,
  eventLogSize = 0,
  eventLogBuffer = null,
  eventLog = null,
  eventLogIndex = 0;
function logEvent(entries) {
  if (null !== eventLog) {
    var offset = eventLogIndex;
    eventLogIndex += entries.length;
    if (eventLogIndex + 1 > eventLogSize) {
      eventLogSize *= 2;
      if (524288 < eventLogSize) {
        console.error(
          "Scheduler Profiling: Event log exceeded maximum size. Don't forget to call `stopLoggingProfilingEvents()`."
        );
        stopLoggingProfilingEvents();
        return;
      }
      var newEventLog = new Int32Array(4 * eventLogSize);
      newEventLog.set(eventLog);
      eventLogBuffer = newEventLog.buffer;
      eventLog = newEventLog;
    }
    eventLog.set(entries, offset);
  }
}
function startLoggingProfilingEvents() {
  eventLogSize = 131072;
  eventLogBuffer = new ArrayBuffer(4 * eventLogSize);
  eventLog = new Int32Array(eventLogBuffer);
  eventLogIndex = 0;
}
function stopLoggingProfilingEvents() {
  var buffer = eventLogBuffer;
  eventLogSize = 0;
  eventLog = eventLogBuffer = null;
  eventLogIndex = 0;
  return buffer;
}
var taskQueue = [],
  timerQueue = [],
  taskIdCounter = 1,
  isSchedulerPaused = !1,
  currentTask = null,
  currentPriorityLevel = 3,
  isPerformingWork = !1,
  isHostCallbackScheduled = !1,
  isHostTimeoutScheduled = !1;
function advanceTimers(currentTime) {
  for (var timer = peek(timerQueue); null !== timer; ) {
    if (null === timer.callback) pop(timerQueue);
    else if (timer.startTime <= currentTime)
      pop(timerQueue),
        (timer.sortIndex = timer.expirationTime),
        push(taskQueue, timer),
        enableProfilingFeatureFlag &&
          (enableProfilingFeatureFlag &&
            null !== eventLog &&
            logEvent([1, 1e3 * currentTime, timer.id, timer.priorityLevel]),
          (timer.isQueued = !0));
    else break;
    timer = peek(timerQueue);
  }
}
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = !1;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled)
    if (null !== peek(taskQueue))
      (isHostCallbackScheduled = !0), requestHostCallback(flushWork);
    else {
      var firstTimer = peek(timerQueue);
      null !== firstTimer &&
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
}
function flushWork(hasTimeRemaining, initialTime) {
  enableProfilingFeatureFlag &&
    enableProfilingFeatureFlag &&
    null !== eventLog &&
    logEvent([8, 1e3 * initialTime, mainThreadIdCounter]);
  isHostCallbackScheduled = !1;
  isHostTimeoutScheduled &&
    ((isHostTimeoutScheduled = !1), cancelHostTimeout());
  isPerformingWork = !0;
  var previousPriorityLevel = currentPriorityLevel;
  try {
    if (enableProfilingFeatureFlag)
      try {
        return workLoop(hasTimeRemaining, initialTime);
      } catch (error) {
        if (null !== currentTask) {
          var currentTime = exports.unstable_now();
          enableProfilingFeatureFlag &&
            null !== eventLog &&
            logEvent([3, 1e3 * currentTime, currentTask.id]);
          currentTask.isQueued = !1;
        }
        throw error;
      }
    else return workLoop(hasTimeRemaining, initialTime);
  } finally {
    (currentTask = null),
      (currentPriorityLevel = previousPriorityLevel),
      (isPerformingWork = !1),
      enableProfilingFeatureFlag &&
        ((hasTimeRemaining = exports.unstable_now()),
        enableProfilingFeatureFlag &&
          (mainThreadIdCounter++,
          null !== eventLog &&
            logEvent([7, 1e3 * hasTimeRemaining, mainThreadIdCounter])));
  }
}
function workLoop(hasTimeRemaining, initialTime) {
  advanceTimers(initialTime);
  for (
    currentTask = peek(taskQueue);
    !(
      null === currentTask ||
      (enableSchedulerDebugging && isSchedulerPaused) ||
      (currentTask.expirationTime > initialTime &&
        (!hasTimeRemaining || exports.unstable_shouldYield()))
    );

  ) {
    var callback = currentTask.callback;
    if ("function" === typeof callback) {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      var didUserCallbackTimeout = currentTask.expirationTime <= initialTime;
      if (enableProfilingFeatureFlag) {
        var task = currentTask;
        enableProfilingFeatureFlag &&
          (runIdCounter++,
          null !== eventLog &&
            logEvent([5, 1e3 * initialTime, task.id, runIdCounter]));
      }
      callback = callback(didUserCallbackTimeout);
      initialTime = exports.unstable_now();
      "function" === typeof callback
        ? ((currentTask.callback = callback),
          enableProfilingFeatureFlag &&
            enableProfilingFeatureFlag &&
            null !== eventLog &&
            logEvent([6, 1e3 * initialTime, currentTask.id, runIdCounter]))
        : (enableProfilingFeatureFlag &&
            (enableProfilingFeatureFlag &&
              null !== eventLog &&
              logEvent([2, 1e3 * initialTime, currentTask.id]),
            (currentTask.isQueued = !1)),
          currentTask === peek(taskQueue) && pop(taskQueue));
      advanceTimers(initialTime);
    } else pop(taskQueue);
    currentTask = peek(taskQueue);
  }
  if (null !== currentTask) return !0;
  hasTimeRemaining = peek(timerQueue);
  null !== hasTimeRemaining &&
    requestHostTimeout(handleTimeout, hasTimeRemaining.startTime - initialTime);
  return !1;
}
var unstable_requestPaint = requestPaint,
  unstable_Profiling = enableProfilingFeatureFlag
    ? {
        startLoggingProfilingEvents: startLoggingProfilingEvents,
        stopLoggingProfilingEvents: stopLoggingProfilingEvents
      }
    : null;
exports.unstable_IdlePriority = 5;
exports.unstable_ImmediatePriority = 1;
exports.unstable_LowPriority = 4;
exports.unstable_NormalPriority = 3;
exports.unstable_Profiling = unstable_Profiling;
exports.unstable_UserBlockingPriority = 2;
exports.unstable_cancelCallback = function(task) {
  if (enableProfilingFeatureFlag && task.isQueued) {
    var currentTime = exports.unstable_now();
    enableProfilingFeatureFlag &&
      null !== eventLog &&
      logEvent([4, 1e3 * currentTime, task.id]);
    task.isQueued = !1;
  }
  task.callback = null;
};
exports.unstable_continueExecution = function() {
  isSchedulerPaused = !1;
  isHostCallbackScheduled ||
    isPerformingWork ||
    ((isHostCallbackScheduled = !0), requestHostCallback(flushWork));
};
exports.unstable_getCurrentPriorityLevel = function() {
  return currentPriorityLevel;
};
exports.unstable_getFirstCallbackNode = function() {
  return peek(taskQueue);
};
exports.unstable_next = function(eventHandler) {
  switch (currentPriorityLevel) {
    case 1:
    case 2:
    case 3:
      var priorityLevel = 3;
      break;
    default:
      priorityLevel = currentPriorityLevel;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
};
exports.unstable_pauseExecution = function() {
  isSchedulerPaused = !0;
};
exports.unstable_requestPaint = unstable_requestPaint;
exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      break;
    default:
      priorityLevel = 3;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
};
exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
  var currentTime = exports.unstable_now();
  "object" === typeof options && null !== options
    ? ((options = options.delay),
      (options =
        "number" === typeof options && 0 < options
          ? currentTime + options
          : currentTime))
    : (options = currentTime);
  switch (priorityLevel) {
    case 1:
      var timeout = -1;
      break;
    case 2:
      timeout = 250;
      break;
    case 5:
      timeout = 1073741823;
      break;
    case 4:
      timeout = 1e4;
      break;
    default:
      timeout = 5e3;
  }
  timeout = options + timeout;
  priorityLevel = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: options,
    expirationTime: timeout,
    sortIndex: -1
  };
  enableProfilingFeatureFlag && (priorityLevel.isQueued = !1);
  options > currentTime
    ? ((priorityLevel.sortIndex = options),
      push(timerQueue, priorityLevel),
      null === peek(taskQueue) &&
        priorityLevel === peek(timerQueue) &&
        (isHostTimeoutScheduled
          ? cancelHostTimeout()
          : (isHostTimeoutScheduled = !0),
        requestHostTimeout(handleTimeout, options - currentTime)))
    : ((priorityLevel.sortIndex = timeout),
      push(taskQueue, priorityLevel),
      enableProfilingFeatureFlag &&
        (enableProfilingFeatureFlag &&
          null !== eventLog &&
          logEvent([
            1,
            1e3 * currentTime,
            priorityLevel.id,
            priorityLevel.priorityLevel
          ]),
        (priorityLevel.isQueued = !0)),
      isHostCallbackScheduled ||
        isPerformingWork ||
        ((isHostCallbackScheduled = !0), requestHostCallback(flushWork)));
  return priorityLevel;
};
exports.unstable_wrapCallback = function(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function() {
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;
    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
};
