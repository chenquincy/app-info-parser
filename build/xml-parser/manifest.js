'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// From https://github.com/openstf/adbkit-apkreader
var BinaryXmlParser = require('./binary');

var INTENT_MAIN = 'android.intent.action.MAIN';
var CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER';

var ManifestParser = function () {
  function ManifestParser(buffer) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ManifestParser);

    this.buffer = buffer;
    this.xmlParser = new BinaryXmlParser(this.buffer, options);
  }

  _createClass(ManifestParser, [{
    key: 'collapseAttributes',
    value: function collapseAttributes(element) {
      var collapsed = Object.create(null);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(element.attributes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var attr = _step.value;

          collapsed[attr.name] = attr.typedValue.value;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return collapsed;
    }
  }, {
    key: 'parseIntents',
    value: function parseIntents(element, target) {
      var _this = this;

      target.intentFilters = [];
      target.metaData = [];

      return element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'intent-filter':
            {
              var intentFilter = _this.collapseAttributes(element);

              intentFilter.actions = [];
              intentFilter.categories = [];
              intentFilter.data = [];

              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'action':
                    intentFilter.actions.push(_this.collapseAttributes(element));
                    break;
                  case 'category':
                    intentFilter.categories.push(_this.collapseAttributes(element));
                    break;
                  case 'data':
                    intentFilter.data.push(_this.collapseAttributes(element));
                    break;
                }
              });

              target.intentFilters.push(intentFilter);
              break;
            }
          case 'meta-data':
            target.metaData.push(_this.collapseAttributes(element));
            break;
        }
      });
    }
  }, {
    key: 'parseApplication',
    value: function parseApplication(element) {
      var _this2 = this;

      var app = this.collapseAttributes(element);

      app.activities = [];
      app.activityAliases = [];
      app.launcherActivities = [];
      app.services = [];
      app.receivers = [];
      app.providers = [];
      app.usesLibraries = [];

      element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'activity':
            {
              var activity = _this2.collapseAttributes(element);
              _this2.parseIntents(element, activity);
              app.activities.push(activity);
              if (_this2.isLauncherActivity(activity)) {
                app.launcherActivities.push(activity);
              }
              break;
            }
          case 'activity-alias':
            {
              var activityAlias = _this2.collapseAttributes(element);
              _this2.parseIntents(element, activityAlias);
              app.activityAliases.push(activityAlias);
              if (_this2.isLauncherActivity(activityAlias)) {
                app.launcherActivities.push(activityAlias);
              }
              break;
            }
          case 'service':
            {
              var service = _this2.collapseAttributes(element);
              _this2.parseIntents(element, service);
              app.services.push(service);
              break;
            }
          case 'receiver':
            {
              var receiver = _this2.collapseAttributes(element);
              _this2.parseIntents(element, receiver);
              app.receivers.push(receiver);
              break;
            }
          case 'provider':
            {
              var provider = _this2.collapseAttributes(element);

              provider.grantUriPermissions = [];
              provider.metaData = [];
              provider.pathPermissions = [];

              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'grant-uri-permission':
                    provider.grantUriPermissions.push(_this2.collapseAttributes(element));
                    break;
                  case 'meta-data':
                    provider.metaData.push(_this2.collapseAttributes(element));
                    break;
                  case 'path-permission':
                    provider.pathPermissions.push(_this2.collapseAttributes(element));
                    break;
                }
              });

              app.providers.push(provider);
              break;
            }
          case 'uses-library':
            app.usesLibraries.push(_this2.collapseAttributes(element));
            break;
        }
      });

      return app;
    }
  }, {
    key: 'isLauncherActivity',
    value: function isLauncherActivity(activity) {
      return activity.intentFilters.some(function (filter) {
        var hasMain = filter.actions.some(function (action) {
          return action.name === INTENT_MAIN;
        });
        if (!hasMain) {
          return false;
        }
        return filter.categories.some(function (category) {
          return category.name === CATEGORY_LAUNCHER;
        });
      });
    }
  }, {
    key: 'parse',
    value: function parse() {
      var _this3 = this;

      var document = this.xmlParser.parse();
      var manifest = this.collapseAttributes(document);

      manifest.usesPermissions = [];
      manifest.permissions = [];
      manifest.permissionTrees = [];
      manifest.permissionGroups = [];
      manifest.instrumentation = null;
      manifest.usesSdk = null;
      manifest.usesConfiguration = null;
      manifest.usesFeatures = [];
      manifest.supportsScreens = null;
      manifest.compatibleScreens = [];
      manifest.supportsGlTextures = [];
      manifest.application = Object.create(null);

      document.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'uses-permission':
            manifest.usesPermissions.push(_this3.collapseAttributes(element));
            break;
          case 'permission':
            manifest.permissions.push(_this3.collapseAttributes(element));
            break;
          case 'permission-tree':
            manifest.permissionTrees.push(_this3.collapseAttributes(element));
            break;
          case 'permission-group':
            manifest.permissionGroups.push(_this3.collapseAttributes(element));
            break;
          case 'instrumentation':
            manifest.instrumentation = _this3.collapseAttributes(element);
            break;
          case 'uses-sdk':
            manifest.usesSdk = _this3.collapseAttributes(element);
            break;
          case 'uses-configuration':
            manifest.usesConfiguration = _this3.collapseAttributes(element);
            break;
          case 'uses-feature':
            manifest.usesFeatures.push(_this3.collapseAttributes(element));
            break;
          case 'supports-screens':
            manifest.supportsScreens = _this3.collapseAttributes(element);
            break;
          case 'compatible-screens':
            element.childNodes.forEach(function (screen) {
              return manifest.compatibleScreens.push(_this3.collapseAttributes(screen));
            });
            break;
          case 'supports-gl-texture':
            manifest.supportsGlTextures.push(_this3.collapseAttributes(element));
            break;
          case 'application':
            manifest.application = _this3.parseApplication(element);
            break;
        }
      });

      return manifest;
    }
  }]);

  return ManifestParser;
}();

module.exports = ManifestParser;