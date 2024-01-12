const Zip = require('./zip')
const { mapInfoResource, findApkIconPath, getBase64FromBuffer } = require('./utils')
const ManifestName = /^androidmanifest\.xml$/
const ResourceName = /^resources\.arsc$/

const AdaptiveIconParser = require('./xml-parser/adaptive-icon')
const ManifestXmlParser = require('./xml-parser/manifest')
const ResourceFinder = require('./resource-finder')

class ApkParser extends Zip {
  /**
   * parser for parsing .apk file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor (file) {
    super(file)
    if (!(this instanceof ApkParser)) {
      return new ApkParser(file)
    }
  }
  parse () {
    return new Promise((resolve, reject) => {
      this.getEntries([ManifestName, ResourceName]).then(buffers => {
        if (!buffers[ManifestName]) {
          throw new Error('AndroidManifest.xml can\'t be found.')
        }
        let apkInfo = this._parseManifest(buffers[ManifestName])
        let resourceMap
        if (!buffers[ResourceName]) {
          resolve(apkInfo)
        } else {
          // parse resourceMap
          resourceMap = this._parseResourceMap(buffers[ResourceName])
          // update apkInfo with resourceMap
          apkInfo = mapInfoResource(apkInfo, resourceMap)
          apkInfo.icon = null
          apkInfo.adaptiveIcons = null

          // find icon path and parse icon
          const iconPath = findApkIconPath(apkInfo)
          if (iconPath.endsWith('.xml')) {
            this.getEntry(iconPath).then(adaptiveIconBuffer => {
              const adaptiveIconParser = new AdaptiveIconParser(adaptiveIconBuffer, resourceMap)
              const adaptiveIcons = adaptiveIconParser.parse()
              return this._getAdaptiveIconBuffers(adaptiveIcons)
            }).then(iconBuffers => {
              apkInfo.adaptiveIcons = iconBuffers
              resolve(apkInfo)
            }).catch(e => {
              resolve(apkInfo)
              console.warn('[Warning] failed to parse adaptive icon: ', e)
            })
          } else if (iconPath) {
            this.getEntry(iconPath).then(iconBuffer => {
              apkInfo.icon = iconBuffer ? getBase64FromBuffer(iconBuffer) : null
              resolve(apkInfo)
            }).catch(e => {
              resolve(apkInfo)
              console.warn('[Warning] failed to parse icon: ', e)
            })
          } else {
            resolve(apkInfo)
          }
        }
      }).catch(e => {
        reject(e)
      })
    })
  }

  _getAdaptiveIconBuffers (icons) {
    const iconBuffers = {}
    const pending = []
    for (let key of Object.keys(icons)) {
      pending.push(this.getEntry(icons[key]).then(buffer => {
        iconBuffers[key] = getBase64FromBuffer(buffer)
      }))
    }
    return Promise.allSettled(pending).then(() => iconBuffers)
  }

  /**
   * Parse manifest
   * @param {Buffer} buffer // manifest file's buffer
   */
  _parseManifest (buffer) {
    try {
      const parser = new ManifestXmlParser(buffer, {
        ignore: [
          'application.activity',
          'application.service',
          'application.receiver',
          'application.provider',
          'permission-group'
        ]
      })
      return parser.parse()
    } catch (e) {
      throw new Error('Parse AndroidManifest.xml error: ', e)
    }
  }
  /**
   * Parse resourceMap
   * @param {Buffer} buffer // resourceMap file's buffer
   */
  _parseResourceMap (buffer) {
    try {
      return new ResourceFinder().processResourceTable(buffer)
    } catch (e) {
      throw new Error('Parser resources.arsc error: ' + e)
    }
  }
}

module.exports = ApkParser
