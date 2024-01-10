const Zip = require('./zip')
const { mapInfoResource, findApkIconPath, getBase64FromBuffer } = require('./utils')
const ManifestName = /^androidmanifest\.xml$/
const ResourceName = /^resources\.arsc$/
const X86 = /^lib[\\/].*-v7a[\\/]/;
const X64 = /^lib[\\/].*-v8a[\\/]/;

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
      this.getEntries([ManifestName, ResourceName, X86, X64]).then(buffers => {
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

          if (buffers[X86]) apkInfo['x86'] = 1;
          if (buffers[X64]) apkInfo['x64'] = 1;

          // find icon path and parse icon
          const iconPath = findApkIconPath(apkInfo)
          if (iconPath) {
            this.getEntry(iconPath).then(iconBuffer => {
              apkInfo.icon = iconBuffer ? getBase64FromBuffer(iconBuffer) : null
              apkInfo.iconBuffer = iconBuffer ?? null;
              resolve(apkInfo)
            }).catch(e => {
              apkInfo.icon = null
              resolve(apkInfo)
              console.warn('[Warning] failed to parse icon: ', e)
            })
          } else {
            apkInfo.icon = null
            resolve(apkInfo)
          }
        }
      }).catch(e => {
        reject(e)
      })
    })
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
