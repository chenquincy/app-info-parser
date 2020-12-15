const parsePlist = require('plist').parse
const parseBplist = require('bplist-parser').parseBuffer
const cgbiToPng = require('cgbi-to-png')

const Zip = require('./zip')
const { findIpaIconPath, getBase64FromBuffer, isBrowser } = require('./utils')

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
        // parse mobile provision
        const provisionInfo = this._parseProvision(buffers[ProvisionName])
        plistInfo.mobileProvision = provisionInfo

        // find icon path and parse icon
        const iconRegex = new RegExp(findIpaIconPath(plistInfo).toLowerCase())
        this.getEntry(iconRegex).then(iconBuffer => {
          try {
            // In general, the ipa file's icon has been specially processed, should be converted
            plistInfo.icon = iconBuffer ? getBase64FromBuffer(cgbiToPng.revert(iconBuffer)) : null
          } catch (err) {
            if (isBrowser()) {
              // Normal conversion in other cases
              plistInfo.icon = iconBuffer ? getBase64FromBuffer(window.btoa(String.fromCharCode(...iconBuffer))) : null
            } else {
              plistInfo.icon = null
              console.warn('[Warning] failed to parse icon: ', err)
            }
          }
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
      throw new Error('Unknown plist buffer type.')
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
      let content = buffer.toString('utf-8')
      const firstIndex = content.indexOf('<?xml')
      const endIndex = content.indexOf('</plist>')
      content = content.slice(firstIndex, endIndex + 8)
      if (content) {
        info = parsePlist(content)
      }
    }
    return info
  }
}

module.exports = IpaParser
