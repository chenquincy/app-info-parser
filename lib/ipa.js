const Zip = require('jszip')
const parseToBuffer = require('typedarray-to-buffer')
const bplistParser = require('bplist-parser').parseBuffer
const plistParser = require('plist').parse

const { findEntry } = require('../utils')
const regex = /^Payload\/(.+)\.app\/Info.plist$/

class IpaParser {
  constructor (file) {
    if (!file) {
      throw new Error('Param miss: filePath')
    }

    this.file = file
  }
  parse () {
    const file = this.file
    return new Promise(function (resolve, reject) {
      const zip = new Zip()
      zip.loadAsync(file).then(function (entries) {
        const entry = findEntry(entries, regex)
        if (!entry) {
          reject(new Error('Info.plist not found'))
        }
        entries.file(entry.name).async('arraybuffer').then(function (aBuffer) {
          const buffer = parseToBuffer(aBuffer)
          let result
          if (buffer[0] === 60) {
            result = plistParser(buffer.toString())
          } else if (buffer[0] === 98) {
            result = bplistParser(buffer)[0]
          } else {
            reject(new Error('Unknow buffer type'))
          }
          resolve(result)
        })
      })
    })
  }
}

module.exports = IpaParser
