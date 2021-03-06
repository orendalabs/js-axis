var axis = {};

var axis = axis || {};
(function () {
  axis.multiTenancy = axis.multiTenancy || {};

  axis.multiTenancy.isEnabled = false;
  axis.multiTenancy.ignoreFeatureCheckForHostUsers = false;

  axis.multiTenancy.sides = {
    TENANT: 1,
    HOST: 2,
  };

  axis.multiTenancy.tenantIdCookieName = "Axis.TenantId";

  axis.multiTenancy.setTenantIdCookie = function (tenantId) {
    if (tenantId) {
      axis.utils.setCookieValue(
        axis.multiTenancy.tenantIdCookieName,
        tenantId.toString(),
        new Date(new Date().getTime() + 5 * 365 * 86400000), //5 years
        axis.appPath,
        axis.domain
      );
    } else {
      axis.utils.deleteCookie(
        axis.multiTenancy.tenantIdCookieName,
        axis.appPath
      );
    }
  };

  axis.multiTenancy.getTenantIdCookie = function () {
    var value = axis.utils.getCookieValue(axis.multiTenancy.tenantIdCookieName);
    if (!value) {
      return null;
    }

    return parseInt(value);
  };
})();

var axis = axis || {};
(function () {

  axis.localization = axis.localization || {};

  axis.localization.languages = [];

  axis.localization.currentLanguage = {};

  axis.localization.sources = [];

  axis.localization.values = {};

  axis.localization.localize = function (key, sourceName) {
    sourceName = sourceName || axis.localization.defaultSourceName;

    var source = axis.localization.values[sourceName];

    if (!source) {
      axis.log.warn("Could not find localization source: " + sourceName);
      return key;
    }

    var value = source[key];
    if (value == undefined) {
      return key;
    }

    var copiedArguments = Array.prototype.slice.call(arguments, 0);
    copiedArguments.splice(1, 1);
    copiedArguments[0] = value;

    return axis.utils.formatString.apply(this, copiedArguments);
  };

  axis.localization.getSource = function (sourceName) {
    return function (key) {
      var copiedArguments = Array.prototype.slice.call(arguments, 0);
      copiedArguments.splice(1, 0, sourceName);
      return axis.localization.localize.apply(this, copiedArguments);
    };
  };

  axis.localization.isCurrentCulture = function (name) {
    return (
      axis.localization.currentCulture &&
      axis.localization.currentCulture.name &&
      axis.localization.currentCulture.name.indexOf(name) == 0
    );
  };

  axis.localization.defaultSourceName = undefined;
  axis.localization.axisWeb = axis.localization.getSource("AxisWeb");
})();

// Implements Authorization API that simplifies usage of authorization scripts generated by Axis.
var axis = axis || {};
(function () {
  axis.auth = axis.auth || {};

  axis.auth.allPermissions = axis.auth.allPermissions || {};

  axis.auth.grantedPermissions = axis.auth.grantedPermissions || {};

  //Deprecated. Use axis.auth.isGranted instead.
  axis.auth.hasPermission = function (permissionName) {
    return axis.auth.isGranted.apply(this, arguments);
  };

  //Deprecated. Use axis.auth.isAnyGranted instead.
  axis.auth.hasAnyOfPermissions = function () {
    return axis.auth.isAnyGranted.apply(this, arguments);
  };

  //Deprecated. Use axis.auth.areAllGranted instead.
  axis.auth.hasAllOfPermissions = function () {
    return axis.auth.areAllGranted.apply(this, arguments);
  };

  axis.auth.isGranted = function (permissionName) {
    return (
      axis.auth.allPermissions[permissionName] != undefined &&
      axis.auth.grantedPermissions[permissionName] != undefined
    );
  };

  axis.auth.isAnyGranted = function () {
    if (!arguments || arguments.length <= 0) {
      return true;
    }

    for (var i = 0; i < arguments.length; i++) {
      if (axis.auth.isGranted(arguments[i])) {
        return true;
      }
    }

    return false;
  };

  axis.auth.areAllGranted = function () {
    if (!arguments || arguments.length <= 0) {
      return true;
    }

    for (var i = 0; i < arguments.length; i++) {
      if (!axis.auth.isGranted(arguments[i])) {
        return false;
      }
    }

    return true;
  };

  axis.auth.tokenCookieName = "Axis.AuthToken";

  axis.auth.setToken = function (authToken, expireDate) {
    axis.utils.setCookieValue(
      axis.auth.tokenCookieName,
      authToken,
      expireDate,
      axis.appPath,
      axis.domain
    );
  };

  axis.auth.getToken = function () {
    return axis.utils.getCookieValue(axis.auth.tokenCookieName);
  };

  axis.auth.clearToken = function () {
    axis.auth.setToken();
  };

  axis.auth.refreshTokenCookieName = "Axis.AuthRefreshToken";

  axis.auth.setRefreshToken = function (refreshToken, expireDate) {
    axis.utils.setCookieValue(
      axis.auth.refreshTokenCookieName,
      refreshToken,
      expireDate,
      axis.appPath,
      axis.domain
    );
  };

  axis.auth.getRefreshToken = function () {
    return axis.utils.getCookieValue(axis.auth.refreshTokenCookieName);
  };

  axis.auth.clearRefreshToken = function () {
    axis.auth.setRefreshToken();
  };
})();

var axis = axis || {};
(function () {
  //Implements Features API that simplifies usage of feature scripts generated by Axis.
  axis.features = axis.features || {};

  axis.features.allFeatures = axis.features.allFeatures || {};

  axis.features.get = function (name) {
    return axis.features.allFeatures[name];
  };

  axis.features.getValue = function (name) {
    var feature = axis.features.get(name);
    if (feature == undefined) {
      return undefined;
    }

    return feature.value;
  };

  axis.features.isEnabled = function (name) {
    var value = axis.features.getValue(name);
    return value == "true" || value == "True";
  };
})();

var axis = axis || {};
(function (define) {
  define(["jquery"], function ($) {
    // Notification - Defines Notification API, not implements it
    axis.notifications = axis.notifications || {};

    axis.notifications.severity = {
      INFO: 0,
      SUCCESS: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4,
    };

    axis.notifications.userNotificationState = {
      UNREAD: 0,
      READ: 1,
    };

    axis.notifications.getUserNotificationStateAsString = function (
      userNotificationState
    ) {
      switch (userNotificationState) {
        case axis.notifications.userNotificationState.READ:
          return "READ";
        case axis.notifications.userNotificationState.UNREAD:
          return "UNREAD";
        default:
          axis.log.warn(
            "Unknown user notification state value: " + userNotificationState
          );
          return "?";
      }
    };

    axis.notifications.getUiNotifyFuncBySeverity = function (severity) {
      switch (severity) {
        case axis.notifications.severity.SUCCESS:
          return axis.notify.success;
        case axis.notifications.severity.WARN:
          return axis.notify.warn;
        case axis.notifications.severity.ERROR:
          return axis.notify.error;
        case axis.notifications.severity.FATAL:
          return axis.notify.error;
        case axis.notifications.severity.INFO:
        default:
          return axis.notify.info;
      }
    };

    axis.notifications.messageFormatters = {};

    axis.notifications.messageFormatters[
      "Axis.Notifications.MessageNotificationData"
    ] = function (userNotification) {
      return (
        userNotification.notification.data.message ||
        userNotification.notification.data.properties.Message
      );
    };

    axis.notifications.messageFormatters[
      "Axis.Notifications.LocalizableMessageNotificationData"
    ] = function (userNotification) {
      var message =
        userNotification.notification.data.message ||
        userNotification.notification.data.properties.Message;
      var localizedMessage = axis.localization.localize(
        message.name,
        message.sourceName
      );

      if (userNotification.notification.data.properties) {
        if ($) {
          //Prefer to use jQuery if possible
          $.each(userNotification.notification.data.properties, function (
            key,
            value
          ) {
            localizedMessage = localizedMessage.replace("{" + key + "}", value);
          });
        } else {
          //alternative for $.each
          var properties = Object.keys(
            userNotification.notification.data.properties
          );
          for (var i = 0; i < properties.length; i++) {
            localizedMessage = localizedMessage.replace(
              "{" + properties[i] + "}",
              userNotification.notification.data.properties[properties[i]]
            );
          }
        }
      }

      return localizedMessage;
    };

    axis.notifications.getFormattedMessageFromUserNotification = function (
      userNotification
    ) {
      var formatter =
        axis.notifications.messageFormatters[
          userNotification.notification.data.type
        ];
      if (!formatter) {
        axis.log.warn(
          "No message formatter defined for given data type: " +
            userNotification.notification.data.type
        );
        return "?";
      }

      if (!axis.utils.isFunction(formatter)) {
        axis.log.warn(
          "Message formatter should be a function! It is invalid for data type: " +
            userNotification.notification.data.type
        );
        return "?";
      }

      return formatter(userNotification);
    };

    axis.notifications.showUiNotifyForUserNotification = function (
      userNotification,
      options
    ) {
      var message = axis.notifications.getFormattedMessageFromUserNotification(
        userNotification
      );
      var uiNotifyFunc = axis.notifications.getUiNotifyFuncBySeverity(
        userNotification.notification.severity
      );
      uiNotifyFunc(message, undefined, options);
    };

    // Notify - Defines Notification API, not implements it
    axis.notify = axis.notify || {};

    axis.notify.success = function (message, title, options) {
      axis.log.warn("axis.notify.success is not implemented!");
    };

    axis.notify.info = function (message, title, options) {
      axis.log.warn("axis.notify.info is not implemented!");
    };

    axis.notify.warn = function (message, title, options) {
      axis.log.warn("axis.notify.warn is not implemented!");
    };

    axis.notify.error = function (message, title, options) {
      axis.log.warn("axis.notify.error is not implemented!");
    };

    return axis;
  });
})(
  typeof define === "function" && define.amd
    ? define
    : function (deps, factory) {
        if (typeof module !== "undefined" && module.exports) {
          module.exports = factory(require("jquery"));
        } else {
          window.axis = factory(window.jQuery);
        }
      }
);

var axis = axis || {};
(function () {
  axis.log = axis.log || {};

  axis.log.levels = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
  };

  axis.log.level = axis.log.levels.DEBUG;

  axis.log.log = function (logObject, logLevel) {
    if (!window.console || !window.console.log) {
      return;
    }

    if (logLevel != undefined && logLevel < axis.log.level) {
      return;
    }
  };

  axis.log.debug = function (logObject) {
    axis.log.log("DEBUG: ", axis.log.levels.DEBUG);
    axis.log.log(logObject, axis.log.levels.DEBUG);
  };

  axis.log.info = function (logObject) {
    axis.log.log("INFO: ", axis.log.levels.INFO);
    axis.log.log(logObject, axis.log.levels.INFO);
  };

  axis.log.warn = function (logObject) {
    axis.log.log("WARN: ", axis.log.levels.WARN);
    axis.log.log(logObject, axis.log.levels.WARN);
  };

  axis.log.error = function (logObject) {
    axis.log.log("ERROR: ", axis.log.levels.ERROR);
    axis.log.log(logObject, axis.log.levels.ERROR);
  };

  axis.log.fatal = function (logObject) {
    axis.log.log("FATAL: ", axis.log.levels.FATAL);
    axis.log.log(logObject, axis.log.levels.FATAL);
  };
})();

var axis = axis || {};
(function (define) {
  define(["jquery"], function ($) {

    // Messages API - Defines Messages API, not implements it
    axis.message = axis.message || {};

    var showMessage = function (message, title, options) {
      alert((title || "") + " " + message);

      if (!$) {
        axis.log.warn(
          "axis.message can not return promise since jQuery is not defined!"
        );
        return null;
      }

      return $.Deferred(function ($dfd) {
        $dfd.resolve();
      });
    };

    axis.message.info = function (message, title, options) {
      axis.log.warn("axis.message.info is not implemented!");
      return showMessage(message, title, options);
    };

    axis.message.success = function (message, title, options) {
      axis.log.warn("axis.message.success is not implemented!");
      return showMessage(message, title, options);
    };

    axis.message.warn = function (message, title, options) {
      axis.log.warn("axis.message.warn is not implemented!");
      return showMessage(message, title, options);
    };

    axis.message.error = function (message, title, options) {
      axis.log.warn("axis.message.error is not implemented!");
      return showMessage(message, title, options);
    };

    axis.message.confirm = function (message, title, callback, options) {
      axis.log.warn("axis.message.confirm is not implemented!");

      var result = confirm(message);
      callback && callback(result);

      if (!$) {
        axis.log.warn(
          "axis.message can not return promise since jQuery is not defined!"
        );
        return null;
      }

      return $.Deferred(function ($dfd) {
        $dfd.resolve();
      });
    };

    return axis;
  });
})(
  typeof define === "function" && define.amd
    ? define
    : function (deps, factory) {
        if (typeof module !== "undefined" && module.exports) {
          module.exports = factory(require("jquery"));
        } else {
          window.axis = factory(window.jQuery);
        }
      }
);

var axis = axis || {};
(function () {
  axis.ui = axis.ui || {};

  // UI Block - Defines UI Block API, not implements it
  axis.ui.block = function (elm) {
    axis.log.warn("axis.ui.block is not implemented!");
  };

  axis.ui.unblock = function (elm) {
    axis.log.warn("axis.ui.unblock is not implemented!");
  };

  // UI BUSY - Defines UI Busy API, not implements it
  axis.ui.setBusy = function (elm, text, delay) {
    axis.log.warn("axis.ui.setBusy is not implemented!");
  };

  axis.ui.clearBusy = function (elm, delay) {
    axis.log.warn("axis.ui.clearBusy is not implemented!");
  };
})();

var axis = axis || {};
(function () {
  axis.event = (function () {
    var _callbacks = {};

    var on = function (eventName, callback) {
      if (!_callbacks[eventName]) {
        _callbacks[eventName] = [];
      }

      _callbacks[eventName].push(callback);
    };

    var off = function (eventName, callback) {
      var callbacks = _callbacks[eventName];
      if (!callbacks) {
        return;
      }

      var index = -1;
      for (var i = 0; i < callbacks.length; i++) {
        if (callbacks[i] === callback) {
          index = i;
          break;
        }
      }

      if (index < 0) {
        return;
      }

      _callbacks[eventName].splice(index, 1);
    };

    var trigger = function (eventName) {
      var callbacks = _callbacks[eventName];
      if (!callbacks || !callbacks.length) {
        return;
      }

      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i].apply(this, args);
      }
    };

    // Public interface ///////////////////////////////////////////////////

    return {
      on: on,
      off: off,
      trigger: trigger,
    };
  })();
})();

var axis = axis || {};
(function (define) {
  define(["jquery"], function ($) {
    axis.utils = axis.utils || {};

    /* Creates a name namespace.
     *  Example:
     *  var taskService = axis.utils.createNamespace(axis, 'services.task');
     *  taskService will be equal to axis.services.task
     *  first argument (root) must be defined first
     ************************************************************/
    axis.utils.createNamespace = function (root, ns) {
      var parts = ns.split(".");
      for (var i = 0; i < parts.length; i++) {
        if (typeof root[parts[i]] == "undefined") {
          root[parts[i]] = {};
        }

        root = root[parts[i]];
      }

      return root;
    };

    /* Find and replaces a string (search) to another string (replacement) in
     *  given string (str).
     *  Example:
     *  axis.utils.replaceAll('This is a test string', 'is', 'X') = 'ThX X a test string'
     ************************************************************/
    axis.utils.replaceAll = function (str, search, replacement) {
      var fix = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return str.replace(new RegExp(fix, "g"), replacement);
    };

    /* Formats a string just like string.format in C#.
     *  Example:
     *  axis.utils.formatString('Hello {0}','Tuana') = 'Hello Tuana'
     ************************************************************/
    axis.utils.formatString = function () {
      if (arguments.length < 1) {
        return null;
      }

      var str = arguments[0];

      for (var i = 1; i < arguments.length; i++) {
        var placeHolder = "{" + (i - 1) + "}";
        str = axis.utils.replaceAll(str, placeHolder, arguments[i]);
      }

      return str;
    };

    axis.utils.toPascalCase = function (str) {
      if (!str || !str.length) {
        return str;
      }

      if (str.length === 1) {
        return str.charAt(0).toUpperCase();
      }

      return str.charAt(0).toUpperCase() + str.substr(1);
    };

    axis.utils.toCamelCase = function (str) {
      if (!str || !str.length) {
        return str;
      }

      if (str.length === 1) {
        return str.charAt(0).toLowerCase();
      }

      return str.charAt(0).toLowerCase() + str.substr(1);
    };

    axis.utils.truncateString = function (str, maxLength) {
      if (!str || !str.length || str.length <= maxLength) {
        return str;
      }

      return str.substr(0, maxLength);
    };

    axis.utils.truncateStringWithPostfix = function (str, maxLength, postfix) {
      postfix = postfix || "...";

      if (!str || !str.length || str.length <= maxLength) {
        return str;
      }

      if (maxLength <= postfix.length) {
        return postfix.substr(0, maxLength);
      }

      return str.substr(0, maxLength - postfix.length) + postfix;
    };

    axis.utils.isFunction = function (obj) {
      if ($) {
        //Prefer to use jQuery if possible
        return $.isFunction(obj);
      }

      //alternative for $.isFunction
      return !!(obj && obj.constructor && obj.call && obj.apply);
    };

    /**
     * parameterInfos should be an array of { name, value } objects
     * where name is query string parameter name and value is it's value.
     * includeQuestionMark is true by default.
     */
    axis.utils.buildQueryString = function (
      parameterInfos,
      includeQuestionMark
    ) {
      if (includeQuestionMark === undefined) {
        includeQuestionMark = true;
      }

      var qs = "";

      function addSeperator() {
        if (!qs.length) {
          if (includeQuestionMark) {
            qs = qs + "?";
          }
        } else {
          qs = qs + "&";
        }
      }

      for (var i = 0; i < parameterInfos.length; ++i) {
        var parameterInfo = parameterInfos[i];
        if (parameterInfo.value === undefined) {
          continue;
        }

        if (parameterInfo.value === null) {
          parameterInfo.value = "";
        }

        addSeperator();

        if (
          parameterInfo.value.toJSON &&
          typeof parameterInfo.value.toJSON === "function"
        ) {
          qs =
            qs +
            parameterInfo.name +
            "=" +
            encodeURIComponent(parameterInfo.value.toJSON());
        } else if (
          Array.isArray(parameterInfo.value) &&
          parameterInfo.value.length
        ) {
          for (var j = 0; j < parameterInfo.value.length; j++) {
            if (j > 0) {
              addSeperator();
            }

            qs =
              qs +
              parameterInfo.name +
              "[" +
              j +
              "]=" +
              encodeURIComponent(parameterInfo.value[j]);
          }
        } else {
          qs =
            qs +
            parameterInfo.name +
            "=" +
            encodeURIComponent(parameterInfo.value);
        }
      }

      return qs;
    };

    /**
     * Sets a cookie value for given key.
     * This is a simple implementation created to be used by ABP.
     * Please use a complete cookie library if you need.
     * @param {string} key
     * @param {string} value
     * @param {Date} expireDate (optional). If not specified the cookie will expire at the end of session.
     * @param {string} path (optional)
     */
    axis.utils.setCookieValue = function (
      key,
      value,
      expireDate,
      path,
      domain
    ) {
      var cookieValue = encodeURIComponent(key) + "=";

      if (value) {
        cookieValue = cookieValue + encodeURIComponent(value);
      }

      if (expireDate) {
        cookieValue = cookieValue + "; expires=" + expireDate.toUTCString();
      }

      if (path) {
        cookieValue = cookieValue + "; path=" + path;
      }

      if (domain) {
        cookieValue = cookieValue + "; domain=" + domain;
      }

      document.cookie = cookieValue;
    };

    /**
     * Gets a cookie with given key.
     * This is a simple implementation created to be used by ABP.
     * Please use a complete cookie library if you need.
     * @param {string} key
     * @returns {string} Cookie value or null
     */
    axis.utils.getCookieValue = function (key) {
      var equalities = document.cookie.split("; ");
      for (var i = 0; i < equalities.length; i++) {
        if (!equalities[i]) {
          continue;
        }

        var splitted = equalities[i].split("=");
        if (splitted.length != 2) {
          continue;
        }

        if (decodeURIComponent(splitted[0]) === key) {
          return decodeURIComponent(splitted[1] || "");
        }
      }

      return null;
    };

    /**
     * Deletes cookie for given key.
     * This is a simple implementation created to be used by ABP.
     * Please use a complete cookie library if you need.
     * @param {string} key
     * @param {string} path (optional)
     */
    axis.utils.deleteCookie = function (key, path) {
      var cookieValue = encodeURIComponent(key) + "=";

      cookieValue =
        cookieValue +
        "; expires=" +
        new Date(new Date().getTime() - 86400000).toUTCString();

      if (path) {
        cookieValue = cookieValue + "; path=" + path;
      }

      document.cookie = cookieValue;
    };

    /**
     * Gets the domain of given url
     * @param {string} url
     * @returns {string}
     */
    axis.utils.getDomain = function (url) {
      var domainRegex = /(https?:){0,1}\/\/((?:[\w\d-]+\.)+[\w\d]{2,})/i;
      var matches = domainRegex.exec(url);
      return matches && matches[2] ? matches[2] : "";
    };

    return axis;
  });
})(
  typeof define === "function" && define.amd
    ? define
    : function (deps, factory) {
        if (typeof module !== "undefined" && module.exports) {
          module.exports = factory(require("jquery"));
        } else {
          window.axis = factory(window.jQuery);
        }
      }
);

var axis = axis || {};
(function () {
  axis.timing = axis.timing || {};

  axis.timing.utcClockProvider = (function () {
    var toUtc = function (date) {
      return Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      );
    };

    var now = function () {
      return toUtc(new Date());
    };

    var normalize = function (date) {
      if (!date) {
        return date;
      }

      return new Date(toUtc(date));
    };

    // Public interface ///////////////////////////////////////////////////

    return {
      now: now,
      normalize: normalize,
      supportsMultipleTimezone: true,
    };
  })();

  axis.timing.localClockProvider = (function () {
    var toLocal = function (date) {
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      );
    };

    var now = function () {
      return toLocal(new Date());
    };

    var normalize = function (date) {
      if (!date) {
        return date;
      }

      return toLocal(date);
    };

    // Public interface
    return {
      now: now,
      normalize: normalize,
      supportsMultipleTimezone: false,
    };
  })();

  axis.timing.unspecifiedClockProvider = (function () {
    var now = function () {
      return new Date();
    };

    var normalize = function (date) {
      return date;
    };

    // Public interface
    return {
      now: now,
      normalize: normalize,
      supportsMultipleTimezone: false,
    };
  })();

  axis.timing.convertToUserTimezone = function (date) {
    var localTime = date.getTime();
    var utcTime = localTime + date.getTimezoneOffset() * 60000;
    var targetTime =
      parseInt(utcTime) +
      parseInt(axis.timing.timeZoneInfo.windows.currentUtcOffsetInMilliseconds);
    return new Date(targetTime);
  };
})();

var axis = axis || {};
(function () {
  axis.clock = axis.clock || {};

  axis.clock.now = function () {
    if (axis.clock.provider) {
      return axis.clock.provider.now();
    }

    return new Date();
  };

  axis.clock.normalize = function (date) {
    if (axis.clock.provider) {
      return axis.clock.provider.normalize(date);
    }

    return date;
  };

  axis.clock.provider = axis.timing.unspecifiedClockProvider;
})();

var axis = axis || {};
(function () {
  axis.security = axis.security || {};
  axis.security.antiForgery = axis.security.antiForgery || {};

  axis.security.antiForgery.tokenCookieName = "XSRF-TOKEN";
  axis.security.antiForgery.tokenHeaderName = "X-XSRF-TOKEN";

  axis.security.antiForgery.getToken = function () {
    return axis.utils.getCookieValue(axis.security.antiForgery.tokenCookieName);
  };

  axis.security.antiForgery.shouldSendToken = function (settings) {
    if (settings.crossDomain === undefined || settings.crossDomain === null) {
      return (
        axis.utils.getDomain(location.href) ===
        axis.utils.getDomain(settings.url)
      );
    }

    return !settings.crossDomain;
  };
})();

var axis = axis || {};
(function () {
  // Current application root path (including virtual directory if exists).
  axis.appPath = axis.appPath || "/";
  axis.pageLoadTime = new Date();

  // Converts given path to absolute path using axis.appPath variable.
  axis.toAbsAppPath = function (path) {
    if (path.indexOf("/") == 0) {
      path = path.substring(1);
    }
    return axis.appPath + path;
  };
})();

var axis = axis || {};
(function () {
  // Implements Settings API that simplifies usage of setting scripts generated by Axis.
  axis.setting = axis.setting || {};

  axis.setting.values = axis.setting.values || {};

  axis.setting.get = function (name) {
    return axis.setting.values[name];
  };

  axis.setting.getBoolean = function (name) {
    var value = axis.setting.get(name);
    return value == "true" || value == "True";
  };

  axis.setting.getInt = function (name) {
    return parseInt(axis.setting.values[name]);
  };
})();
