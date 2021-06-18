const PBManifestParser = require('./xml-parser/pb-manifest')
const Zip = require('./zip')
const ManifestName = 'AndroidManifest.xml'
const ResourceName = 'resources.pb'

class AabParser extends Zip {
  /**
   * parser for parsing .apk file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor (file) {
    super(file)
    if (!(this instanceof AabParser)) {
      return new AabParser(file)
    }
  }
  parse () {
    return new Promise((resolve, reject) => {
      this.getEntries([ManifestName, ResourceName]).then(buffers => {
        if (!buffers[ManifestName]) {
          throw new Error('AndroidManifest.xml can\'t be found.')
        }
        let info = this._parseManifest(buffers[ManifestName])
        console.info(' ===> ', info)
        resolve(info)
        // TODO: parse resources and map info with that
        // if (!buffers[ResourceName]) {
        //   resolve(info)
        // } else {
        //   const resourceMap = this._parseResourceMap(buffers[ResourceName])
        //   console.info('resource => ', resourceMap)
        // }
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
      const parser = new PBManifestParser(buffer)
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
      // TODO: parse resources.pb
    } catch (e) {
      throw new Error('Parser resources.pb error: ' + e)
    }
  }
}

module.exports = AabParser
