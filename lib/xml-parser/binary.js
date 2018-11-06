// From https://github.com/openstf/adbkit-apkreader
const NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  CDATA_SECTION_NODE: 4
}

const ChunkType = {
  NULL: 0x0000,
  STRING_POOL: 0x0001,
  TABLE: 0x0002,
  XML: 0x0003,
  XML_FIRST_CHUNK: 0x0100,
  XML_START_NAMESPACE: 0x0100,
  XML_END_NAMESPACE: 0x0101,
  XML_START_ELEMENT: 0x0102,
  XML_END_ELEMENT: 0x0103,
  XML_CDATA: 0x0104,
  XML_LAST_CHUNK: 0x017f,
  XML_RESOURCE_MAP: 0x0180,
  TABLE_PACKAGE: 0x0200,
  TABLE_TYPE: 0x0201,
  TABLE_TYPE_SPEC: 0x0202
}

const StringFlags = {
  SORTED: 1 << 0,
  UTF8: 1 << 8
}

// Taken from android.util.TypedValue
const TypedValue = {
  COMPLEX_MANTISSA_MASK: 0x00ffffff,
  COMPLEX_MANTISSA_SHIFT: 0x00000008,
  COMPLEX_RADIX_0p23: 0x00000003,
  COMPLEX_RADIX_16p7: 0x00000001,
  COMPLEX_RADIX_23p0: 0x00000000,
  COMPLEX_RADIX_8p15: 0x00000002,
  COMPLEX_RADIX_MASK: 0x00000003,
  COMPLEX_RADIX_SHIFT: 0x00000004,
  COMPLEX_UNIT_DIP: 0x00000001,
  COMPLEX_UNIT_FRACTION: 0x00000000,
  COMPLEX_UNIT_FRACTION_PARENT: 0x00000001,
  COMPLEX_UNIT_IN: 0x00000004,
  COMPLEX_UNIT_MASK: 0x0000000f,
  COMPLEX_UNIT_MM: 0x00000005,
  COMPLEX_UNIT_PT: 0x00000003,
  COMPLEX_UNIT_PX: 0x00000000,
  COMPLEX_UNIT_SHIFT: 0x00000000,
  COMPLEX_UNIT_SP: 0x00000002,
  DENSITY_DEFAULT: 0x00000000,
  DENSITY_NONE: 0x0000ffff,
  TYPE_ATTRIBUTE: 0x00000002,
  TYPE_DIMENSION: 0x00000005,
  TYPE_FIRST_COLOR_INT: 0x0000001c,
  TYPE_FIRST_INT: 0x00000010,
  TYPE_FLOAT: 0x00000004,
  TYPE_FRACTION: 0x00000006,
  TYPE_INT_BOOLEAN: 0x00000012,
  TYPE_INT_COLOR_ARGB4: 0x0000001e,
  TYPE_INT_COLOR_ARGB8: 0x0000001c,
  TYPE_INT_COLOR_RGB4: 0x0000001f,
  TYPE_INT_COLOR_RGB8: 0x0000001d,
  TYPE_INT_DEC: 0x00000010,
  TYPE_INT_HEX: 0x00000011,
  TYPE_LAST_COLOR_INT: 0x0000001f,
  TYPE_LAST_INT: 0x0000001f,
  TYPE_NULL: 0x00000000,
  TYPE_REFERENCE: 0x00000001,
  TYPE_STRING: 0x00000003
}

class BinaryXmlParser {
  constructor (buffer, options = {}) {
    this.buffer = buffer
    this.cursor = 0
    this.strings = []
    this.resources = []
    this.document = null
    this.parent = null
    this.stack = []
    this.debug = options.debug || false
  }

  readU8 () {
    this.debug && console.group('readU8')
    this.debug && console.debug('cursor:', this.cursor)
    const val = this.buffer[this.cursor]
    this.debug && console.debug('value:', val)
    this.cursor += 1
    this.debug && console.groupEnd()
    return val
  }

  readU16 () {
    this.debug && console.group('readU16')
    this.debug && console.debug('cursor:', this.cursor)
    const val = this.buffer.readUInt16LE(this.cursor)
    this.debug && console.debug('value:', val)
    this.cursor += 2
    this.debug && console.groupEnd()
    return val
  }

  readS32 () {
    this.debug && console.group('readS32')
    this.debug && console.debug('cursor:', this.cursor)
    const val = this.buffer.readInt32LE(this.cursor)
    this.debug && console.debug('value:', val)
    this.cursor += 4
    this.debug && console.groupEnd()
    return val
  }

  readU32 () {
    this.debug && console.group('readU32')
    this.debug && console.debug('cursor:', this.cursor)
    const val = this.buffer.readUInt32LE(this.cursor)
    this.debug && console.debug('value:', val)
    this.cursor += 4
    this.debug && console.groupEnd()
    return val
  }

  readLength8 () {
    this.debug && console.group('readLength8')
    let len = this.readU8()
    if (len & 0x80) {
      len = (len & 0x7f) << 8
      len += this.readU8()
    }
    this.debug && console.debug('length:', len)
    this.debug && console.groupEnd()
    return len
  }

  readLength16 () {
    this.debug && console.group('readLength16')
    let len = this.readU16()
    if (len & 0x8000) {
      len = (len & 0x7fff) << 16
      len += this.readU16()
    }
    this.debug && console.debug('length:', len)
    this.debug && console.groupEnd()
    return len
  }

  readDimension () {
    this.debug && console.group('readDimension')

    const dimension = {
      value: null,
      unit: null,
      rawUnit: null
    }

    const value = this.readU32()
    const unit = dimension.value & 0xff

    dimension.value = value >> 8
    dimension.rawUnit = unit

    switch (unit) {
      case TypedValue.COMPLEX_UNIT_MM:
        dimension.unit = 'mm'
        break
      case TypedValue.COMPLEX_UNIT_PX:
        dimension.unit = 'px'
        break
      case TypedValue.COMPLEX_UNIT_DIP:
        dimension.unit = 'dp'
        break
      case TypedValue.COMPLEX_UNIT_SP:
        dimension.unit = 'sp'
        break
      case TypedValue.COMPLEX_UNIT_PT:
        dimension.unit = 'pt'
        break
      case TypedValue.COMPLEX_UNIT_IN:
        dimension.unit = 'in'
        break
    }

    this.debug && console.groupEnd()

    return dimension
  }

  readFraction () {
    this.debug && console.group('readFraction')

    const fraction = {
      value: null,
      type: null,
      rawType: null
    }

    const value = this.readU32()
    const type = value & 0xf

    fraction.value = this.convertIntToFloat(value >> 4)
    fraction.rawType = type

    switch (type) {
      case TypedValue.COMPLEX_UNIT_FRACTION:
        fraction.type = '%'
        break
      case TypedValue.COMPLEX_UNIT_FRACTION_PARENT:
        fraction.type = '%p'
        break
    }

    this.debug && console.groupEnd()

    return fraction
  }

  readHex24 () {
    this.debug && console.group('readHex24')
    var val = (this.readU32() & 0xffffff).toString(16)
    this.debug && console.groupEnd()
    return val
  }

  readHex32 () {
    this.debug && console.group('readHex32')
    var val = this.readU32().toString(16)
    this.debug && console.groupEnd()
    return val
  }

  readTypedValue () {
    this.debug && console.group('readTypedValue')

    const typedValue = {
      value: null,
      type: null,
      rawType: null
    }

    const start = this.cursor

    let size = this.readU16()
    /* const zero = */ this.readU8()
    const dataType = this.readU8()

    // Yes, there has been a real world APK where the size is malformed.
    if (size === 0) {
      size = 8
    }

    typedValue.rawType = dataType

    switch (dataType) {
      case TypedValue.TYPE_INT_DEC:
        typedValue.value = this.readS32()
        typedValue.type = 'int_dec'
        break
      case TypedValue.TYPE_INT_HEX:
        typedValue.value = this.readS32()
        typedValue.type = 'int_hex'
        break
      case TypedValue.TYPE_STRING:
        var ref = this.readS32()
        typedValue.value = ref > 0 ? this.strings[ref] : ''
        typedValue.type = 'string'
        break
      case TypedValue.TYPE_REFERENCE:
        var id = this.readU32()
        typedValue.value = `resourceId:0x${id.toString(16)}`
        typedValue.type = 'reference'
        break
      case TypedValue.TYPE_INT_BOOLEAN:
        typedValue.value = this.readS32() !== 0
        typedValue.type = 'boolean'
        break
      case TypedValue.TYPE_NULL:
        this.readU32()
        typedValue.value = null
        typedValue.type = 'null'
        break
      case TypedValue.TYPE_INT_COLOR_RGB8:
        typedValue.value = this.readHex24()
        typedValue.type = 'rgb8'
        break
      case TypedValue.TYPE_INT_COLOR_RGB4:
        typedValue.value = this.readHex24()
        typedValue.type = 'rgb4'
        break
      case TypedValue.TYPE_INT_COLOR_ARGB8:
        typedValue.value = this.readHex32()
        typedValue.type = 'argb8'
        break
      case TypedValue.TYPE_INT_COLOR_ARGB4:
        typedValue.value = this.readHex32()
        typedValue.type = 'argb4'
        break
      case TypedValue.TYPE_DIMENSION:
        typedValue.value = this.readDimension()
        typedValue.type = 'dimension'
        break
      case TypedValue.TYPE_FRACTION:
        typedValue.value = this.readFraction()
        typedValue.type = 'fraction'
        break
      default: {
        const type = dataType.toString(16)
        console.debug(`Not sure what to do with typed value of type 0x${type}, falling back to reading an uint32.`)
        typedValue.value = this.readU32()
        typedValue.type = 'unknown'
      }
    }

    // Ensure we consume the whole value
    const end = start + size
    if (this.cursor !== end) {
      const type = dataType.toString(16)
      const diff = end - this.cursor
      console.debug(`Cursor is off by ${diff} bytes at ${this.cursor} at supposed end \
of typed value of type 0x${type}. The typed value started at offset ${start} \
and is supposed to end at offset ${end}. Ignoring the rest of the value.`)
      this.cursor = end
    }

    this.debug && console.groupEnd()

    return typedValue
  }

  // https://twitter.com/kawasima/status/427730289201139712
  convertIntToFloat (int) {
    const buf = new ArrayBuffer(4)
    ;(new Int32Array(buf))[0] = int
    return (new Float32Array(buf))[0]
  }

  readString (encoding) {
    this.debug && console.group('readString', encoding)
    switch (encoding) {
      case 'utf-8':
        var stringLength = this.readLength8(encoding)
        this.debug && console.debug('stringLength:', stringLength)
        var byteLength = this.readLength8(encoding)
        this.debug && console.debug('byteLength:', byteLength)
        var value = this.buffer.toString(encoding, this.cursor, (this.cursor += byteLength))
        this.debug && console.debug('value:', value)
        this.debug && console.groupEnd()
        return value
      case 'ucs2':
        stringLength = this.readLength16(encoding)
        this.debug && console.debug('stringLength:', stringLength)
        byteLength = stringLength * 2
        this.debug && console.debug('byteLength:', byteLength)
        value = this.buffer.toString(encoding, this.cursor, (this.cursor += byteLength))
        this.debug && console.debug('value:', value)
        this.debug && console.groupEnd()
        return value
      default:
        throw new Error(`Unsupported encoding '${encoding}'`)
    }
  }

  readChunkHeader () {
    this.debug && console.group('readChunkHeader')
    var header = {
      startOffset: this.cursor,
      chunkType: this.readU16(),
      headerSize: this.readU16(),
      chunkSize: this.readU32()
    }
    this.debug && console.debug('startOffset:', header.startOffset)
    this.debug && console.debug('chunkType:', header.chunkType)
    this.debug && console.debug('headerSize:', header.headerSize)
    this.debug && console.debug('chunkSize:', header.chunkSize)
    this.debug && console.groupEnd()
    return header
  }

  readStringPool (header) {
    this.debug && console.group('readStringPool')

    header.stringCount = this.readU32()
    this.debug && console.debug('stringCount:', header.stringCount)
    header.styleCount = this.readU32()
    this.debug && console.debug('styleCount:', header.styleCount)
    header.flags = this.readU32()
    this.debug && console.debug('flags:', header.flags)
    header.stringsStart = this.readU32()
    this.debug && console.debug('stringsStart:', header.stringsStart)
    header.stylesStart = this.readU32()
    this.debug && console.debug('stylesStart:', header.stylesStart)

    if (header.chunkType !== ChunkType.STRING_POOL) {
      throw new Error('Invalid string pool header')
    }

    const offsets = []
    for (let i = 0, l = header.stringCount; i < l; ++i) {
      this.debug && console.debug('offset:', i)
      offsets.push(this.readU32())
    }

    const sorted = (header.flags & StringFlags.SORTED) === StringFlags.SORTED
    this.debug && console.debug('sorted:', sorted)
    const encoding = (header.flags & StringFlags.UTF8) === StringFlags.UTF8
      ? 'utf-8'
      : 'ucs2'
    this.debug && console.debug('encoding:', encoding)

    const stringsStart = header.startOffset + header.stringsStart
    this.cursor = stringsStart
    for (let i = 0, l = header.stringCount; i < l; ++i) {
      this.debug && console.debug('string:', i)
      this.debug && console.debug('offset:', offsets[i])
      this.cursor = stringsStart + offsets[i]
      this.strings.push(this.readString(encoding))
    }

    // Skip styles
    this.cursor = header.startOffset + header.chunkSize

    this.debug && console.groupEnd()

    return null
  }

  readResourceMap (header) {
    this.debug && console.group('readResourceMap')
    const count = Math.floor((header.chunkSize - header.headerSize) / 4)
    for (let i = 0; i < count; ++i) {
      this.resources.push(this.readU32())
    }
    this.debug && console.groupEnd()
    return null
  }

  readXmlNamespaceStart (/* header */) {
    this.debug && console.group('readXmlNamespaceStart')

    /* const line = */ this.readU32()
    /* const commentRef = */ this.readU32()
    /* const prefixRef = */ this.readS32()
    /* const uriRef = */ this.readS32()

    // We don't currently care about the values, but they could
    // be accessed like so:
    //
    // namespaceURI.prefix = this.strings[prefixRef] // if prefixRef > 0
    // namespaceURI.uri = this.strings[uriRef] // if uriRef > 0

    this.debug && console.groupEnd()

    return null
  }

  readXmlNamespaceEnd (/* header */) {
    this.debug && console.group('readXmlNamespaceEnd')

    /* const line = */ this.readU32()
    /* const commentRef = */ this.readU32()
    /* const prefixRef = */ this.readS32()
    /* const uriRef = */ this.readS32()

    // We don't currently care about the values, but they could
    // be accessed like so:
    //
    // namespaceURI.prefix = this.strings[prefixRef] // if prefixRef > 0
    // namespaceURI.uri = this.strings[uriRef] // if uriRef > 0

    this.debug && console.groupEnd()

    return null
  }

  readXmlElementStart (/* header */) {
    this.debug && console.group('readXmlElementStart')

    const node = {
      namespaceURI: null,
      nodeType: NodeType.ELEMENT_NODE,
      nodeName: null,
      attributes: [],
      childNodes: []
    }

    /* const line = */ this.readU32()
    /* const commentRef = */ this.readU32()
    const nsRef = this.readS32()
    const nameRef = this.readS32()

    if (nsRef > 0) {
      node.namespaceURI = this.strings[nsRef]
    }

    node.nodeName = this.strings[nameRef]

    /* const attrStart = */ this.readU16()
    /* const attrSize = */ this.readU16()
    const attrCount = this.readU16()
    /* const idIndex = */ this.readU16()
    /* const classIndex = */ this.readU16()
    /* const styleIndex = */ this.readU16()

    for (let i = 0; i < attrCount; ++i) {
      node.attributes.push(this.readXmlAttribute())
    }

    if (this.document) {
      this.parent.childNodes.push(node)
      this.parent = node
    } else {
      this.document = (this.parent = node)
    }

    this.stack.push(node)

    this.debug && console.groupEnd()

    return node
  }

  readXmlAttribute () {
    this.debug && console.group('readXmlAttribute')

    const attr = {
      namespaceURI: null,
      nodeType: NodeType.ATTRIBUTE_NODE,
      nodeName: null,
      name: null,
      value: null,
      typedValue: null
    }

    const nsRef = this.readS32()
    const nameRef = this.readS32()
    const valueRef = this.readS32()

    if (nsRef > 0) {
      attr.namespaceURI = this.strings[nsRef]
    }

    attr.nodeName = attr.name = this.strings[nameRef]

    if (valueRef > 0) {
      attr.value = this.strings[valueRef]
    }

    attr.typedValue = this.readTypedValue()

    this.debug && console.groupEnd()

    return attr
  }

  readXmlElementEnd (/* header */) {
    this.debug && console.group('readXmlCData')

    /* const line = */ this.readU32()
    /* const commentRef = */ this.readU32()
    /* const nsRef = */ this.readS32()
    /* const nameRef = */ this.readS32()

    this.stack.pop()
    this.parent = this.stack[this.stack.length - 1]

    this.debug && console.groupEnd()

    return null
  }

  readXmlCData (/* header */) {
    this.debug && console.group('readXmlCData')

    const cdata = {
      namespaceURI: null,
      nodeType: NodeType.CDATA_SECTION_NODE,
      nodeName: '#cdata',
      data: null,
      typedValue: null
    }

    /* const line = */ this.readU32()
    /* const commentRef = */ this.readU32()
    const dataRef = this.readS32()

    if (dataRef > 0) {
      cdata.data = this.strings[dataRef]
    }

    cdata.typedValue = this.readTypedValue()

    this.parent.childNodes.push(cdata)

    this.debug && console.groupEnd()

    return cdata
  }

  readNull (header) {
    this.debug && console.group('readNull')
    this.cursor += header.chunkSize - header.headerSize
    this.debug && console.groupEnd()
    return null
  }

  parse () {
    this.debug && console.group('BinaryXmlParser.parse')

    const xmlHeader = this.readChunkHeader()
    if (xmlHeader.chunkType !== ChunkType.XML) {
      throw new Error('Invalid XML header')
    }

    while (this.cursor < this.buffer.length) {
      this.debug && console.group('chunk')
      const start = this.cursor
      const header = this.readChunkHeader()
      switch (header.chunkType) {
        case ChunkType.STRING_POOL:
          this.readStringPool(header)
          break
        case ChunkType.XML_RESOURCE_MAP:
          this.readResourceMap(header)
          break
        case ChunkType.XML_START_NAMESPACE:
          this.readXmlNamespaceStart(header)
          break
        case ChunkType.XML_END_NAMESPACE:
          this.readXmlNamespaceEnd(header)
          break
        case ChunkType.XML_START_ELEMENT:
          this.readXmlElementStart(header)
          break
        case ChunkType.XML_END_ELEMENT:
          this.readXmlElementEnd(header)
          break
        case ChunkType.XML_CDATA:
          this.readXmlCData(header)
          break
        case ChunkType.NULL:
          this.readNull(header)
          break
        default:
          throw new Error(`Unsupported chunk type '${header.chunkType}'`)
      }

      // Ensure we consume the whole chunk
      const end = start + header.chunkSize
      if (this.cursor !== end) {
        const diff = end - this.cursor
        const type = header.chunkType.toString(16)
        console.debug(`Cursor is off by ${diff} bytes at ${this.cursor} at supposed \
end of chunk of type 0x${type}. The chunk started at offset ${start} and is \
supposed to end at offset ${end}. Ignoring the rest of the chunk.`)
        this.cursor = end
      }

      this.debug && console.groupEnd()
    }

    this.debug && console.groupEnd()

    return this.document
  }
}

module.exports = BinaryXmlParser
