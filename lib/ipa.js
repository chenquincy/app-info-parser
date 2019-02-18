const Zip = require('./zip')
const parsePlist = require('plist').parse
const parseBplist = require('bplist-parser').parseBuffer
const cgbiToPng = require('cgbi-to-png')

const { findIpaInfoIcon, getBase64FromBuffer } = require('./utils')

const PlistName = new RegExp('payload/.+?.app/info.plist$', 'i')
const ProvisionName = /payload\/.+?\.app\/embedded.mobileprovision/

class IpaParser extends Zip {
  constructor (file) {
    super(file)
    if (!(this instanceof IpaParser)) {
      return new IpaParser(file)
    }
  }
  async parse () {
    const buffers = await this.getEntries([PlistName, ProvisionName])
    // 解析 plist
    const plistInfo = this._parsePlist(buffers[PlistName])
    // 解析 mobileprovision
    const provisionInfo = this._parseProvision(buffers[ProvisionName])
    plistInfo.mobileProvision = provisionInfo

    // 解析 ipa安装包图标
    const iconRegex = new RegExp(findIpaInfoIcon(plistInfo).toLowerCase())
    const iconBuffer = await this.getEntry(iconRegex)
    // ipa安装包的图标被特殊处理过，需要经过转换
    plistInfo.icon = getBase64FromBuffer(cgbiToPng.revert(iconBuffer))

    return plistInfo
  }
  /**
   * 解析plist文件
   * @param {Buffer} buffer // 要解析的plist文件buffer
   */
  _parsePlist (buffer) {
    let result
    const bufferType = buffer[0]
    if (bufferType === 60 || bufferType === '<' || bufferType === 239) {
      result = parsePlist(buffer.toString())
    } else if (bufferType === 98) {
      result = parseBplist(buffer)[0]
    } else {
      console.error('Unknow plist buffer type.')
      result = {}
    }
    return result
  }
  /**
   * 解析provision文件
   * @param {Buffer} buffer // 要解析的plist文件buffer
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
