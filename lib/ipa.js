const Zip = require('jszip')
const parseToBuffer = require('typedarray-to-buffer')
const bplistParser = require('bplist-parser').parseBuffer
const plistParser = require('plist').parse

const { assert, findEntry } = require('../utils')
const regex = /^Payload\/(.+)\.app\/Info.plist$/

class IpaParser {
  constructor (file) {
    assert(file, 'Param miss: file')

    this.file = file
  }
  parse () {
    const file = this.file
    return new Promise(function (resolve, reject) {
      const zip = new Zip()
      zip.loadAsync(file).then(function (entries) {
        const entry = findEntry(entries, regex)
        assert(entry, 'AndroidManifest.xml not found')
        if (!entry) {
          reject(new Error('AndroidManifest.xml not found'))
        }
        entries.file(entry.name).async('arraybuffer').then(function (aBuffer) {
          const buffer = parseToBuffer(aBuffer)
          let result
          if (buffer[0] === 60) {
            result = plistParser(buffer.toString())
          } else if (buffer[0] === 98) {
            result = bplistParser(buffer)
          } else {
            reject(new Error('Unknow buffer type'))
          }
          resolve(result[0])
        })
      })
    })
  }
}

module.exports = IpaParser
