const Unzip = require('isomorphic-unzip')
const { isBrowser, decodeNullUnicode } = require('./utils')

class Zip {
  constructor (file) {
    if (isBrowser()) {
      if (!(file instanceof window.Blob || typeof file.size !== 'undefined')) {
        throw new Error('Param error: [file] must be an instance of Blob or File in browser.')
      }
      this.file = file
    } else {
      if (typeof file !== 'string') {
        throw new Error('Param error: [file] must be file path in Node.')
      }
      this.file = require('path').resolve(file)
    }
    this.unzip = new Unzip(this.file)
  }

  /**
   * get entries by regexs, the return format is: { <filename>: <Buffer|Blob> }
   * @param {Array} regexs // regexs for matching files
   * @param {String} type // return type, can be buffer or blob, default buffer
   */
  getEntries (regexs, type = 'buffer') {
    regexs = regexs.map(regex => decodeNullUnicode(regex))
    return new Promise((resolve, reject) => {
      this.unzip.getBuffer(regexs, { type }, (err, buffers) => {
        err ? reject(err) : resolve(buffers)
      })
    })
  }
  /**
   * get entry by regex, return an instance of Buffer or Blob
   * @param {Regex} regex // regex for matching file
   * @param {String} type // return type, can be buffer or blob, default buffer
   */
  getEntry (regex, type = 'buffer') {
    regex = decodeNullUnicode(regex)
    return new Promise((resolve, reject) => {
      this.unzip.getBuffer([regex], { type }, (err, buffers) => {
        err ? reject(err) : resolve(buffers[regex])
      })
    })
  }
}

module.exports = Zip
