const Unzip = require('isomorphic-unzip')
const { isBrowser } = require('./utils')

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
   * 获取安装包文件，返回类型：{ <filename>: <Buffer|Blob> }
   * @param {Array} regexs // 匹配文件的正则表达式数组
   * @param {String} type // 输出文件类型，默认buffer，type='blob'时返回blob
   */
  getEntries (regexs, type = 'buffer') {
    return new Promise((resolve, reject) => {
      this.unzip.getBuffer(regexs, { type }, (err, buffers) => {
        err ? reject(err) : resolve(buffers)
      })
    })
  }
  getEntry (regex, type = 'buffer') {
    return new Promise((resolve, reject) => {
      this.unzip.getBuffer([regex], { type }, (err, buffers) => {
        err ? reject(err) : resolve(buffers[regex])
      })
    })
  }
}

module.exports = Zip
