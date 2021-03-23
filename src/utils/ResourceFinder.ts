/**
 * Code translated from a C# project https://github.com/hylander0/Iteedee.ApkReader/blob/master/Iteedee.ApkReader/ApkResourceFinder.cs
 *
 * Decode binary file `resources.arsc` from a .apk file to a JavaScript Object.
 */
import ByteBuffer from 'bytebuffer';

const DEBUG = false;

const RES_STRING_POOL_TYPE = 0x0001;
const RES_TABLE_TYPE = 0x0002;
const RES_TABLE_PACKAGE_TYPE = 0x0200;
const RES_TABLE_TYPE_TYPE = 0x0201;
const RES_TABLE_TYPE_SPEC_TYPE = 0x0202;

// The 'data' holds a ResTable_ref, a reference to another resource
// table entry.
const TYPE_REFERENCE = 0x01;
// The 'data' holds an index into the containing resource table's
// global value string pool.
const TYPE_STRING = 0x03;

export interface ManifestResourceConfig {
  language: string;
  region: string;
  locate: string;
}

export class ResourceFinder {
  valueStringPool: string[];
  typeStringPool: string[];
  keyStringPool: string[];
  packageId: number;
  responseMap: {
    [n: number]: any;
    [x: string]: any;
  };
  entryMap: {
    [n: number]: any;
    [x: string]: any;
  };
  constructor() {
    this.valueStringPool = [];
    this.typeStringPool = [];
    this.keyStringPool = [];

    this.packageId = 0;

    this.responseMap = {};
    this.entryMap = {};
  }

  /**
   * Same to C# BinaryReader.readBytes
   *
   * @param bb ByteBuffer
   * @param len length
   * @returns {Buffer}
   */
  static readBytes(bb: ByteBuffer, len: number): ByteBuffer {
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = bb.readUint8();
    }

    return ByteBuffer.wrap(uint8Array, 'binary', true);
  }

  /**
   *
   * @param {ByteBuffer} bb
   * @return {Map<String, Set<String>>}
   */
  public processResourceTable(resourceBuffer: ArrayBuffer) {
    const bb = ByteBuffer.wrap(resourceBuffer, 'binary', true);

    const type = bb.readShort();
    const headerSize = bb.readShort();
    const size = bb.readInt();
    const packageCount = bb.readInt();
    let buffer;
    let bb2;

    if (type !== RES_TABLE_TYPE) {
      throw new Error('No RES_TABLE_TYPE found!');
    }

    if (size !== bb.limit) {
      throw new Error(
        'The buffer size not matches to the resource table size.'
      );
    }
    bb.offset = headerSize;

    let realStringPoolCount = 0;
    let realPackageCount = 0;

    while (true) {
      let pos: number, t: number, s: number;
      try {
        pos = bb.offset;
        t = bb.readShort();
        // headerSize
        bb.readShort();
        s = bb.readInt();
      } catch (error) {
        break;
      }

      if (t === RES_STRING_POOL_TYPE) {
        // Process the string pool
        if (realStringPoolCount === 0) {
          // Only the first string pool is processed.
          if (DEBUG) {
            console.log('Processing the string pool ...');
          }

          buffer = new ByteBuffer(s);
          bb.offset = pos;
          bb.prependTo(buffer);

          bb2 = ByteBuffer.wrap(buffer, 'binary', true);

          bb2.LE();
          this.valueStringPool = this.processStringPool(bb2);
        }
        realStringPoolCount++;
      } else if (t === RES_TABLE_PACKAGE_TYPE) {
        // Process the package
        if (DEBUG) {
          console.log('Processing the package ' + realPackageCount + ' ...');
        }

        const buffer = new ByteBuffer(s);
        bb.offset = pos;
        bb.prependTo(buffer as ByteBuffer);

        bb2 = ByteBuffer.wrap(buffer, 'binary', true);
        bb2.LE();
        this.processPackage(bb2);

        realPackageCount++;
      } else {
        throw new Error('Unsupported type');
      }
      bb.offset = pos + s;
      if (!bb.remaining()) {
        break;
      }
    }

    if (realStringPoolCount !== 1) {
      throw new Error('More than 1 string pool found!');
    }
    if (realPackageCount !== packageCount) {
      throw new Error('Real package count not equals the declared count.');
    }

    return this.responseMap;
  }

  private processPackage(bb: ByteBuffer) {
    // type
    bb.readShort();
    const headerSize = bb.readShort();
    // size
    bb.readInt();
    const id = bb.readInt();

    this.packageId = id;

    for (let i = 0; i < 256; i++) {
      bb.readUint8();
    }

    const typeStrings = bb.readInt();
    // lastPublicType
    bb.readInt();
    const keyStrings = bb.readInt();
    // lastPublicKey
    bb.readInt();

    if (typeStrings !== headerSize) {
      throw new Error(
        'TypeStrings must immediately following the package structure header.'
      );
    }

    if (DEBUG) {
      console.log('Type strings:');
    }

    let lastPosition = bb.offset;
    bb.offset = typeStrings;
    const bbTypeStrings = ResourceFinder.readBytes(bb, bb.limit - bb.offset);
    bb.offset = lastPosition;
    this.typeStringPool = this.processStringPool(bbTypeStrings);

    if (DEBUG) {
      console.log('Key strings:');
    }

    bb.offset = keyStrings;
    // keyType
    bb.readShort();
    // keyHeaderSize
    bb.readShort();
    const keySize = bb.readInt();

    lastPosition = bb.offset;
    bb.offset = keyStrings;
    const bbKeyStrings = ResourceFinder.readBytes(bb, bb.limit - bb.offset);
    bb.offset = lastPosition;
    this.keyStringPool = this.processStringPool(bbKeyStrings);

    bb.offset = keyStrings + keySize;

    let bb2;

    while (true) {
      const pos = bb.offset;
      let t: number, s: number;
      try {
        t = bb.readShort();
        // headerSize
        bb.readShort();
        s = bb.readInt();
      } catch (e) {
        break;
      }

      if (t === RES_TABLE_TYPE_SPEC_TYPE) {
        bb.offset = pos;
        bb2 = ResourceFinder.readBytes(bb, s);
        this.processTypeSpec(bb2);
      } else if (t === RES_TABLE_TYPE_TYPE) {
        bb.offset = pos;
        bb2 = ResourceFinder.readBytes(bb, s);
        this.processType(bb2);
      }

      if (s === 0) {
        break;
      }

      bb.offset = pos + s;

      if (!bb.remaining()) {
        break;
      }
    }
  }

  processConfig(bb: ByteBuffer): ManifestResourceConfig {
    const config: ManifestResourceConfig = {
      language: '',
      region: '',
      locate: 'default',
    };

    // mcc
    bb.readShort();
    // mnc
    bb.readShort();
    const configLanguage = [bb.readByte(), bb.readByte()];
    const configRegion = [bb.readByte(), bb.readByte()];

    if (configLanguage.every(Boolean)) {
      config.language = String.fromCharCode(...configLanguage);
    }

    if (configRegion.every(Boolean)) {
      config.region = String.fromCharCode(...configRegion);
    }

    if (config.language) {
      config.locate = config.language;
    }

    if (config.region) {
      config.region += `-r${config.region}`;
    }

    return config;
  }

  private processType(bb: ByteBuffer) {
    // type
    bb.readShort();
    const headerSize = bb.readShort();
    // size
    bb.readInt();
    const id = bb.readByte();
    // res0
    bb.readByte();
    // res1
    bb.readShort();
    const entryCount = bb.readInt();
    const entriesStart = bb.readInt();

    const refKeys: any = {};

    const configSize = bb.readInt();
    const configBuffer = ResourceFinder.readBytes(bb, configSize);
    const resConfig = this.processConfig(configBuffer);

    // Skip the config data
    bb.offset = headerSize;

    if (headerSize + entryCount * 4 !== entriesStart) {
      throw new Error('HeaderSize, entryCount and entriesStart are not valid.');
    }

    // Start to get entry indices
    let entryIndices = new Array(entryCount);
    for (var i = 0; i < entryCount; ++i) {
      entryIndices[i] = bb.readInt();
    }

    // Get entries
    for (let i = 0; i < entryCount; i++) {
      if (entryIndices[i] === -1) {
        continue;
      }

      const resourceId = (this.packageId << 24) | (id << 16) | i;

      let entryFlag: number, entryKey: number;
      try {
        // entrySize
        bb.readShort();
        entryFlag = bb.readShort();
        entryKey = bb.readInt();
      } catch (error) {
        break;
      }
      let valueDataType: number;
      let valueData: number;
      // Get the value (simple) or map (complex)
      const FLAG_COMPLEX = 0x0001;
      if ((entryFlag & FLAG_COMPLEX) === 0) {
        // valueSize
        bb.readShort();
        // valueRes0
        bb.readByte();
        valueDataType = bb.readByte();
        valueData = bb.readInt();

        const idStr = Number(resourceId).toString(16);
        const keyStr = this.keyStringPool[entryKey];

        let data = '';

        if (DEBUG) {
          console.log(
            'Entry 0x' + idStr + ', key: ' + keyStr + ', simple value type: '
          );
        }

        const key = parseInt(idStr, 16);
        let entryArr = this.entryMap[key] || [];
        entryArr.push(keyStr);

        this.entryMap[key] = entryArr;

        if (valueDataType === TYPE_STRING) {
          data = this.valueStringPool[valueData];

          if (DEBUG) {
            console.log(`, data: ${data}`);
          }
        } else if (valueDataType === TYPE_REFERENCE) {
          refKeys[idStr] = valueData;
        } else {
          data = String(valueData);
          if (DEBUG) {
            console.log(`, data: ${data}`);
          }
        }

        this.putIntoMap(`@${idStr}`, data, resConfig);
      } else {
        // Complex case
        // entryParent
        bb.readInt();
        const entryCount = bb.readInt();

        for (let j = 0; j < entryCount; j++) {
          // refName
          bb.readInt();
          // valueSize
          bb.readShort();
          // valueRes0
          bb.readByte();
          // valueDataType
          bb.readByte();
          // valueData
          bb.readInt();
        }

        if (DEBUG) {
          console.log(
            `Entry 0x${Number(resourceId).toString(16)}, key: ${
              this.keyStringPool[entryKey]
            }, complex value, not printed.`
          );
        }
      }
    }

    for (const refKey in refKeys) {
      const values = this.responseMap[
        '@' +
          Number(refKeys[refKey])
            .toString(16)
            .toUpperCase()
      ];
      if (values && Object.keys(values).length < 1000) {
        for (const value in values) {
          this.putIntoMap('@' + refKey, value, resConfig);
        }
      }
    }
  }

  private processStringPool(bb: ByteBuffer): string[] {
    // type
    bb.readShort();
    // headerSize
    bb.readShort();
    // size
    bb.readInt();
    const stringCount = bb.readInt();
    // styleCount
    bb.readInt();
    const flags = bb.readInt();
    const stringsStart = bb.readInt();
    // stylesStart
    bb.readInt();

    let u16len: number, buffer: ByteBuffer;

    const isUTF_8 = (flags & 256) !== 0;

    const offsets = new Array(stringCount);
    for (let i = 0; i < stringCount; ++i) {
      offsets[i] = bb.readInt();
    }

    const strings = new Array<string>(stringCount);

    for (let i = 0; i < stringCount; ++i) {
      const pos = stringsStart + offsets[i];
      bb.offset = pos;

      strings[i] = '';

      if (isUTF_8) {
        u16len = bb.readUint8();

        if ((u16len & 0x80) !== 0) {
          u16len = ((u16len & 0x7f) << 8) + bb.readUint8();
        }

        let u8len = bb.readUint8();
        if ((u8len & 0x80) !== 0) {
          u8len = ((u8len & 0x7f) << 8) + bb.readUint8();
        }

        if (u8len > 0) {
          buffer = ResourceFinder.readBytes(bb, u8len);
          try {
            strings[i] = ByteBuffer.wrap(buffer, 'utf8', true).toString('utf8');
          } catch (e) {
            if (DEBUG) {
              console.error(e);
              console.log('Error when turning buffer to utf-8 string.');
            }
          }
        } else {
          strings[i] = '';
        }
      } else {
        u16len = bb.readUint16();
        if ((u16len & 0x8000) !== 0) {
          // larger than 32768
          u16len = ((u16len & 0x7fff) << 16) + bb.readUint16();
        }

        if (u16len > 0) {
          const len = u16len * 2;
          buffer = ResourceFinder.readBytes(bb, len);
          try {
            strings[i] = ByteBuffer.wrap(buffer, 'utf8', true).toString('utf8');
          } catch (e) {
            if (DEBUG) {
              console.error(e);
              console.log('Error when turning buffer to utf-8 string.');
            }
          }
        }
      }

      if (DEBUG) {
        console.log('Parsed value: {0}', strings[i]);
      }
    }

    return strings;
  }

  processTypeSpec(bb: ByteBuffer) {
    // type
    bb.readShort();
    // headerSize
    bb.readShort();
    // size
    bb.readInt();
    const id = bb.readByte();
    // res0
    bb.readByte();
    // res1
    bb.readShort();
    const entryCount = bb.readInt();

    if (DEBUG) {
      console.log(
        'Processing type spec ' + this.typeStringPool[id - 1] + '...'
      );
    }

    const flags = new Array(entryCount);

    for (let i = 0; i < entryCount; ++i) {
      flags[i] = bb.readInt();
    }
  }

  putIntoMap(resId: string, value: string, config: ManifestResourceConfig) {
    if (!this.responseMap[resId.toUpperCase()]) {
      this.responseMap[resId.toUpperCase()] = [];
    }

    this.responseMap[resId.toUpperCase()].push({
      value,
      locate: config.locate,
    });
  }
}
