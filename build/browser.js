'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApkParser = require('./apk');
var IpaParser = require('./ipa');
var supportFileTypes = ['ipa', 'apk'];

var AppInfoParser = function () {
  function AppInfoParser(file) {
    _classCallCheck(this, AppInfoParser);

    var splits = file.name.split('.');
    var fileType = splits[splits.length - 1];
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupport file type!');
    }
    this.file = file;

    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(file);
        break;
      case 'apk':
        this.parser = new ApkParser(file);
        break;
    }
  }

  _createClass(AppInfoParser, [{
    key: 'parse',
    value: function parse() {
      return this.parser.parse();
    }
  }]);

  return AppInfoParser;
}();

module.exports = AppInfoParser;