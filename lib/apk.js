const Zip = require('./zip')
const { mapInfoResource, findApkInfoIcon, getBase64FromBuffer } = require('./utils')
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
  async parse () {
    try {
      const buffers = await this.getEntries([ManifestName, ResourceName])
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
        resourceMap = this._parseresourceMap(buffers[ResourceName])
      }
      // 结合resourcemap再次解析apkInfo
      apkInfo = mapInfoResource(apkInfo, resourceMap)
      // 获取icon base64值
      const iconBuffer = await this.getEntry(findApkInfoIcon(apkInfo))
      apkInfo.icon = getBase64FromBuffer(iconBuffer)

      return apkInfo
    } catch (e) {
      throw e
    }
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
  _parseresourceMap (buffer) {
    try {
      return new ResourceFinder().processResourceTable(buffer)
    } catch (e) {
      throw new Error('Parser resources.arsc error: ' + e)
    }
  }
}

module.exports = ApkParser
