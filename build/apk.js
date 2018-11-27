'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zip = require('jszip');

var _require = require('../utils'),
    findEntry = _require.findEntry;

var regex = /^AndroidManifest\.xml$/;
var ManifestXmlParser = require('./xml-parser/manifest');

var ApkParser = function () {
  function ApkParser(file) {
    _classCallCheck(this, ApkParser);

    if (!file) {
      throw new Error('Param miss: filePath');
    }

    this.file = file;
  }

  _createClass(ApkParser, [{
    key: 'parse',
    value: function parse() {
      var file = this.file;
      return new Promise(function (resolve, reject) {
        var zip = new Zip();
        zip.loadAsync(file).then(function (entries) {
          var entry = findEntry(entries, regex);
          if (!entry) {
            reject(new Error('AndroidManifest.xml not found'));
          }
          entries.file(entry.name).async('nodebuffer').then(function (binaryString) {
            var buffer = new ManifestXmlParser(binaryString);
            var result = buffer.parse();
            resolve(result);
          });
        });
      });
    }
  }]);

  return ApkParser;
}();

module.exports = ApkParser;