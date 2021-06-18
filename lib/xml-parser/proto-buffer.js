const protoBuffer = require('protobufjs')
const { isArray } = require('../utils')
const json = require('./proto/resource.json')

const root = protoBuffer.Root.fromJSON(json)
const XmlNode = root.lookupType('aapt.pb.XmlNode')

function formatPBManifest (result = {}, object) {
  object.attribute.forEach(item => {
    if (item.compiledItem && item.compiledItem.prim && item.compiledItem.prim.intDecimalValue) {
      result[item.name] = item.compiledItem.prim.intDecimalValue
    } else {
      result[item.name] = item.value
    }
  })
  const child = object.child.filter(item => !!item.element).map(item => item.element)
  child.forEach(item => {
    if (result[item.name] === undefined) {
      result[item.name] = {}
      formatPBManifest(result[item.name], item)
    } else {
      if (!isArray(result[item.name])) {
        result[item.name] = [result[item.name]]
      }
      const temp = {}
      formatPBManifest(temp, item)
      result[item.name].push(temp)
    }
  })
}

function parsePBManifest (buffer) {
  const xml = XmlNode.decode(buffer)
  const xmlObject = XmlNode.toObject(xml, {
    enums: String,
    arrays: true,
    objects: true
  })
  if (xmlObject.element) {
    const result = {}
    formatPBManifest(result, xmlObject.element)
    console.info(result)
  }
  return xmlObject
}

function parsePBResources (buffer) {
  const xml = XmlNode.decode(buffer)
  const xmlObject = XmlNode.toObject(xml, {
    enums: String,
    arrays: true,
    objects: true
  })
  return xmlObject
}

module.exports = {
  parsePBManifest,
  parsePBResources
}
