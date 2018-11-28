'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Zip = require('jszip');
var parseToBuffer = require('typedarray-to-buffer');
var bplistParser = require('bplist-parser').parseBuffer;
var plistParser = require('plist').parse;

var _require = require('../utils'),
    findEntry = _require.findEntry;

var regex = /^Payload\/(.+)\.app\/Info.plist$/;

var IpaParser = function () {
  function IpaParser(file) {
    _classCallCheck(this, IpaParser);

    if (!file) {
      throw new Error('Param miss: filePath');
    }

    this.file = file;
  }

  _createClass(IpaParser, [{
    key: 'parse',
    value: function parse() {
      var file = this.file;
      return new Promise(function (resolve, reject) {
        var zip = new Zip();
        zip.loadAsync(file).then(function (entries) {
          var entry = findEntry(entries, regex);
          if (!entry) {
            reject(new Error('Info.plist not found'));
          }
          entries.file(entry.name).async('arraybuffer').then(function (aBuffer) {
            var buffer = parseToBuffer(aBuffer);
            var result = void 0;
            if (buffer[0] === 60) {
              result = plistParser(buffer.toString());
            } else if (buffer[0] === 98) {
              result = bplistParser(buffer)[0];
            } else {
              reject(new Error('Unknow buffer type'));
            }
            resolve(result);
          });
        });
      });
    }
  }]);

  return IpaParser;
}();

module.exports = IpaParser;