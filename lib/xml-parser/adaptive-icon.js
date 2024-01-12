const {mapInfoResource, findApkIconPath} = require('../utils')
const BinaryXmlParser = require('./binary')

const ICON_NODE_NAMES = ['foreground', 'background', 'monochrome']

class AdaptiveIconParser {
  constructor (buffer, resourceMap, options = {}) {
    this.buffer = buffer
    this.resourceMap = resourceMap
    this.xmlParser = new BinaryXmlParser(this.buffer, options)
  }

  parse () {
    const document = this.xmlParser.parse()
    const adaptiveIcon = {}

    if (document.nodeName === 'adaptive-icon') {
      document.childNodes.forEach(element => {
        if (ICON_NODE_NAMES.includes(element.nodeName)) {
          adaptiveIcon[element.nodeName] = this.parseAdaptiveIconElement(element)
        }
      })
      return adaptiveIcon
    }
    return null
  }

  parseAdaptiveIconElement (element) {
    const collapsed = Object.create(null)
    for (let attr of Array.from(element.attributes)) {
      collapsed[attr.name] = attr.typedValue.value
    }
    const resource = mapInfoResource(collapsed, this.resourceMap)
    if (resource.drawable) {
      return findApkIconPath({
        application: {
          icon: resource.drawable
        }
      })
    }
    return ''
  }
}

module.exports = AdaptiveIconParser
