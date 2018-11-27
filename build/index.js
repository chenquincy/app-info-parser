'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');
var ApkParser = require('./apk');
var IpaParser = require('./ipa');
var supportFileTypes = ['ipa', 'apk'];

var AppInfoParser = function () {
  function AppInfoParser(filename) {
    _classCallCheck(this, AppInfoParser);

    if (!filename) {
      throw new Error('Param miss: filename');
    }
    var splits = filename.split('.');
    var fileType = splits[splits.length - 1];
    if (!supportFileTypes.includes(fileType)) {
      throw new Error('Unsupport file type');
    }
    this.filename = filename;
    this.file = fs.readFileSync(path.join(__dirname, filename));

    switch (fileType) {
      case 'ipa':
        this.parser = new IpaParser(this.file);
        break;
      case 'apk':
        this.parser = new ApkParser(this.file);
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