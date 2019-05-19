const Zip = require('./zip')
const { mapInfoResource, findApkIconPath, getBase64FromBuffer } = require('./utils')
const ManifestName = /^androidmanifest\.xml$/
const ResourceName = /^resources\.arsc$/

const ManifestXmlParser = require('./xml-parser/manifest')
const ResourceFinder = require('./resource-finder')

class ApkParser extends Zip {
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
        // 解析 manifest
        let apkInfo = this._parseManifest(buffers[ManifestName])
        // 解析 resourcemap
        let resourceMap
        if (!buffers[ResourceName]) {
          resourceMap = {}
        } else {
          // 解析 resourcemap
          resourceMap = this._parseResourceMap(buffers[ResourceName])
          // 结合resourcemap再次解析apkInfo
          apkInfo = mapInfoResource(apkInfo, resourceMap)

          // 获取icon base64值
          const iconPath = findApkIconPath(apkInfo)
          if (iconPath) {
            this.getEntries(iconPath).then(iconBuffer => {
              apkInfo.icon = getBase64FromBuffer(iconBuffer)
              resolve(apkInfo)
            }).catch(e => {
              reject(e)
            })
          } else {
            apkInfo.icon = null
          }
        }
        resolve(apkInfo)
      }).catch(e => {
        reject(e)
      })
    })
  }
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
  _parseResourceMap (buffer) {
    try {
      return new ResourceFinder().processResourceTable(buffer)
    } catch (e) {
      throw new Error('Parser resources.arsc error: ' + e)
    }
  }
}

module.exports = ApkParser
