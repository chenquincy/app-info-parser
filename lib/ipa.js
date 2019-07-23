const Zip = require('./zip')
const parsePlist = require('plist').parse
const parseBplist = require('bplist-parser').parseBuffer
const cgbiToPng = require('cgbi-to-png')

const { findIpaIconPath, getBase64FromBuffer } = require('./utils')

const PlistName = new RegExp('payload/.+?.app/info.plist$', 'i')
const ProvisionName = /payload\/.+?\.app\/embedded.mobileprovision/

class IpaParser extends Zip {
  /**
   * parser for parsing .ipa file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor (file) {
    super(file)
    if (!(this instanceof IpaParser)) {
      return new IpaParser(file)
    }
  }
  parse () {
    return new Promise((resolve, reject) => {
      this.getEntries([PlistName, ProvisionName]).then(buffers => {
        if (!buffers[PlistName]) {
          throw new Error('Info.plist can\'t be found.')
        }
        const plistInfo = this._parsePlist(buffers[PlistName])
        // parse mobileprovision
        const provisionInfo = this._parseProvision(buffers[ProvisionName])
        plistInfo.mobileProvision = provisionInfo

        // find icon path and parse icon
        const iconRegex = new RegExp(findIpaIconPath(plistInfo).toLowerCase())
        this.getEntry(iconRegex).then(iconBuffer => {
          // The ipa file's icon has been specially processed, should be converted
          plistInfo.icon = iconBuffer ? getBase64FromBuffer(cgbiToPng.revert(iconBuffer)) : null
          resolve(plistInfo)
        }).catch(e => {
          reject(e)
        })
      }).catch(e => {
        reject(e)
      })
    })
  }
  /**
   * Parse plist
   * @param {Buffer} buffer // plist file's buffer
   */
  _parsePlist (buffer) {
    let result
    const bufferType = buffer[0]
    if (bufferType === 60 || bufferType === '<' || bufferType === 239) {
      result = parsePlist(buffer.toString())
    } else if (bufferType === 98) {
      result = parseBplist(buffer)[0]
    } else {
      throw new Error('Unknow plist buffer type.')
    }
    return result
  }
  /**
   * parse provision
   * @param {Buffer} buffer // provision file's buffer
   */
  _parseProvision (buffer) {
    let info = {}
    if (buffer) {
      info = buffer.toString('utf-8')
      const firstIndex = info.indexOf('<')
      const endIndex = info.indexOf('</plist>')
      info = info.slice(firstIndex, endIndex + 8)
      info = parsePlist(info)
    }
    return info
  }
}

module.exports = IpaParser
