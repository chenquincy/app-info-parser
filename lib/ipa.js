const Zip = require('./zip')
const parsePlist = require('plist').parse
const parseBplist = require('bplist-parser').parseBuffer
const cgbiToPng = require('cgbi-to-png')

const { findIpaIconPath, getBase64FromBuffer } = require('./utils')

const plistName = new RegExp('payload/.+?.app/info.plist$', 'i')
const provisionName = /payload\/.+?\.app\/embedded.mobileprovision/

// TODO: .app file
const appPlistName = new RegExp(/^[\w,\s-]+\.app\/info.plist$/, 'i')
const appProvisionName = new RegExp(/^[\w,\s-]+\.app\/embedded.mobileprovision$/, 'i')
const appName = new RegExp(/^[\w,\s-]+\.app\/$/, 'gm') // TODO: filename = XXXX.app/

class IpaParser extends Zip {
  /**
   * IpaParser constructor
   * @param {*} file
   * @param {*} type ipa or zipped app file
   */
  constructor (file) {
    super(file)
    if (!(this instanceof IpaParser)) {
      return new IpaParser(file)
    }
  }
  parse () {
    return new Promise((resolve, reject) => {
      this.getEntries([appName, appPlistName, appProvisionName, plistName, provisionName])
        .then(buffers => {
          const isAppFile = !!buffers[appName]

          const plistBuffer = buffers[isAppFile ? appPlistName : plistName]

          if (!plistBuffer) {
            throw new Error("Info.plist can't be found.")
          }
          // TODO: Parse plist
          const plistInfo = this._parsePlist(plistBuffer)
          // TODO: Parse mobileprovision
          const provisionBuffer = buffers[isAppFile ? appProvisionName : provisionName]
          const provisionInfo = this._parseProvision(provisionBuffer)
          plistInfo.mobileProvision = provisionInfo

          // TODO: Parse Installation package icon
          const iconRegex = new RegExp(
            findIpaIconPath(plistInfo).toLowerCase()
          )
          this.getEntry(iconRegex)
            .then(iconBuffer => {
              // TODO: The icon of the ipa installation package has been specially processed and needs to be converted.
              plistInfo.icon = iconBuffer
                ? getBase64FromBuffer(cgbiToPng.revert(iconBuffer))
                : null
              resolve(plistInfo)
            })
            .catch(e => {
              reject(e)
            })
        })
        .catch(e => {
          reject(e)
        })
    })
  }
  /**
   * Parse the plist file
   * @param {Buffer} buffer Plist file buffer to be parsed
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
   * Parsing the provision file
   * @param {Buffer} buffer // Plist file buffer to be parsed
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
