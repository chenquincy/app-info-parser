/**
 * Code translated from a C# project https://github.com/hylander0/Iteedee.ApkReader/blob/master/Iteedee.ApkReader/ApkResourceFinder.cs
 *
 * Decode binary file `resources.arsc` from a .apk file to a JavaScript Object.
 */

var ByteBuffer = require("bytebuffer");

var DEBUG = false;

var RES_STRING_POOL_TYPE = 0x0001;
var RES_TABLE_TYPE = 0x0002;
var RES_TABLE_PACKAGE_TYPE = 0x0200;
var RES_TABLE_TYPE_TYPE = 0x0201;
var RES_TABLE_TYPE_SPEC_TYPE = 0x0202;

// The 'data' holds a ResTable_ref, a reference to another resource
// table entry.
var TYPE_REFERENCE = 0x01;
// The 'data' holds an index into the containing resource table's
// global value string pool.
var TYPE_STRING = 0x03;

function ResourceFinder() {
  this.valueStringPool = null;
  this.typeStringPool = null;
  this.keyStringPool = null;

  this.package_id = 0;

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
ResourceFinder.readBytes = function(bb, len) {
  var uint8Array = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    uint8Array[i] = bb.readUint8();
  }

  return ByteBuffer.wrap(uint8Array, "binary", true);
};

//
/**
 *
 * @param {ByteBuffer} bb
 * @return {Map<String, Set<String>>}
 */
ResourceFinder.prototype.processResourceTable = function(resourceBuffer) {
  const bb = ByteBuffer.wrap(resourceBuffer, "binary", true);

  // Resource table structure
  var type = bb.readShort(),
    headerSize = bb.readShort(),
    size = bb.readInt(),
    packageCount = bb.readInt(),
    buffer,
    bb2;
  if (type != RES_TABLE_TYPE) {
    throw new Error("No RES_TABLE_TYPE found!");
  }
  if (size != bb.limit) {
    throw new Error("The buffer size not matches to the resource table size.");
  }
  bb.offset = headerSize;

  var realStringPoolCount = 0,
    realPackageCount = 0;

  while (true) {
    var pos, t, hs, s;
    try {
      pos = bb.offset;
      t = bb.readShort();
      hs = bb.readShort();
      s = bb.readInt();
    } catch (e) {
      break;
    }
    if (t == RES_STRING_POOL_TYPE) {
      // Process the string pool
      if (realStringPoolCount == 0) {
        // Only the first string pool is processed.
        if (DEBUG) {
          console.log("Processing the string pool ...");
        }

        buffer = new ByteBuffer(s);
        bb.offset = pos;
        bb.prependTo(buffer);

        bb2 = ByteBuffer.wrap(buffer, "binary", true);

        bb2.LE();
        this.valueStringPool = this.processStringPool(bb2);
      }
      realStringPoolCount++;
    } else if (t == RES_TABLE_PACKAGE_TYPE) {
      // Process the package
      if (DEBUG) {
        console.log("Processing the package " + realPackageCount + " ...");
      }

      buffer = new ByteBuffer(s);
      bb.offset = pos;
      bb.prependTo(buffer);

      bb2 = ByteBuffer.wrap(buffer, "binary", true);
      bb2.LE();
      this.processPackage(bb2);

      realPackageCount++;
    } else {
      throw new Error("Unsupported type");
    }
    bb.offset = pos + s;
    if (!bb.remaining()) break;
  }

  if (realStringPoolCount != 1) {
    throw new Error("More than 1 string pool found!");
  }
  if (realPackageCount != packageCount) {
    throw new Error("Real package count not equals the declared count.");
  }

  return this.responseMap;
};

/**
 *
 * @param {ByteBuffer} bb
 */
ResourceFinder.prototype.processPackage = function(bb) {
  // Package structure
  var type = bb.readShort(),
    headerSize = bb.readShort(),
    size = bb.readInt(),
    id = bb.readInt();

  this.package_id = id;

  for (var i = 0; i < 256; ++i) {
    bb.readUint8();
  }

  var typeStrings = bb.readInt(),
    lastPublicType = bb.readInt(),
    keyStrings = bb.readInt(),
    lastPublicKey = bb.readInt();

  if (typeStrings != headerSize) {
    throw new Error(
      "TypeStrings must immediately following the package structure header."
    );
  }

  if (DEBUG) {
    console.log("Type strings:");
  }

  var lastPosition = bb.offset;
  bb.offset = typeStrings;
  var bbTypeStrings = ResourceFinder.readBytes(bb, bb.limit - bb.offset);
  bb.offset = lastPosition;
  this.typeStringPool = this.processStringPool(bbTypeStrings);

  // Key strings
  if (DEBUG) {
    console.log("Key strings:");
  }

  bb.offset = keyStrings;
  var key_type = bb.readShort(),
    key_headerSize = bb.readShort(),
    key_size = bb.readInt();

  lastPosition = bb.offset;
  bb.offset = keyStrings;
  var bbKeyStrings = ResourceFinder.readBytes(bb, bb.limit - bb.offset);
  bb.offset = lastPosition;
  this.keyStringPool = this.processStringPool(bbKeyStrings);

  // Iterate through all chunks
  var typeSpecCount = 0;
  var typeCount = 0;

  bb.offset = keyStrings + key_size;

  var bb2;

  while (true) {
    var pos = bb.offset;
    try {
      var t = bb.readShort();
      var hs = bb.readShort();
      var s = bb.readInt();
    } catch (e) {
      break;
    }

    if (t == RES_TABLE_TYPE_SPEC_TYPE) {
      bb.offset = pos;
      bb2 = ResourceFinder.readBytes(bb, s);
      this.processTypeSpec(bb2);

      typeSpecCount++;
    } else if (t == RES_TABLE_TYPE_TYPE) {
      bb.offset = pos;
      bb2 = ResourceFinder.readBytes(bb, s);
      this.processType(bb2);

      typeCount++;
    }

    if (s == 0) {
      break;
    }

    bb.offset = pos + s;

    if (!bb.remaining()) {
      break;
    }
  }
};

/**
 *
 * @param {ByteBuffer} bb
 */
ResourceFinder.prototype.processType = function(bb) {
  var type = bb.readShort(),
    headerSize = bb.readShort(),
    size = bb.readInt(),
    id = bb.readByte(),
    res0 = bb.readByte(),
    res1 = bb.readShort(),
    entryCount = bb.readInt(),
    entriesStart = bb.readInt();

  var refKeys = {};

  var config_size = bb.readInt();

  // Skip the config data
  bb.offset = headerSize;

  if (headerSize + entryCount * 4 != entriesStart) {
    throw new Error("HeaderSize, entryCount and entriesStart are not valid.");
  }

  // Start to get entry indices
  var entryIndices = new Array(entryCount);
  for (var i = 0; i < entryCount; ++i) {
    entryIndices[i] = bb.readInt();
  }

  // Get entries
  for (var i = 0; i < entryCount; ++i) {
    if (entryIndices[i] == -1) continue;

    var resource_id = (this.package_id << 24) | (id << 16) | i;

    var pos = bb.offset,
      entry_size = bb.readShort(),
      entry_flag = bb.readShort(),
      entry_key = bb.readInt(),
      value_size,
      value_res0,
      value_dataType,
      value_data;

    // Get the value (simple) or map (complex)

    var FLAG_COMPLEX = 0x0001;
    if ((entry_flag & FLAG_COMPLEX) == 0) {
      // Simple case
      value_size = bb.readShort();
      value_res0 = bb.readByte();
      value_dataType = bb.readByte();
      value_data = bb.readInt();

      var idStr = Number(resource_id).toString(16);
      var keyStr = this.keyStringPool[entry_key];

      var data = null;

      if (DEBUG) {
        console.log(
          "Entry 0x" + idStr + ", key: " + keyStr + ", simple value type: "
        );
      }

      var key = parseInt(idStr, 16);

      var entryArr = this.entryMap[key];
      if (entryArr == null) {
        entryArr = [];
      }
      entryArr.push(keyStr);

      this.entryMap[key] = entryArr;

      if (value_dataType == TYPE_STRING) {
        data = this.valueStringPool[value_data];

        if (DEBUG) {
          console.log(", data: " + this.valueStringPool[value_data] + "");
        }
      } else if (value_dataType == TYPE_REFERENCE) {
        var hexIndex = Number(value_data).toString(16);

        refKeys[idStr] = value_data;
      } else {
        data = "" + value_data;
        if (DEBUG) {
          console.log(", data: " + value_data + "");
        }
      }

      this.putIntoMap("@" + idStr, data);
    } else {
      // Complex case
      var entry_parent = bb.readInt();
      var entry_count = bb.readInt();

      for (var j = 0; j < entry_count; ++j) {
        var ref_name = bb.readInt();
        value_size = bb.readShort();
        value_res0 = bb.readByte();
        value_dataType = bb.readByte();
        value_data = bb.readInt();
      }

      if (DEBUG) {
        console.log(
          "Entry 0x" +
            Number(resource_id).toString(16) +
            ", key: " +
            this.keyStringPool[entry_key] +
            ", complex value, not printed."
        );
      }
    }
  }

  for (var refK in refKeys) {
    var values = this.responseMap[
      "@" +
        Number(refKeys[refK])
          .toString(16)
          .toUpperCase()
    ];
    if (values != null && Object.keys(values).length < 1000) {
      for (var value in values) {
        this.putIntoMap("@" + refK, value);
      }
    }
  }
};

/**
 *
 * @param {ByteBuffer} bb
 * @return {Array}
 */
ResourceFinder.prototype.processStringPool = function(bb) {
  // String pool structure
  //
  var type = bb.readShort(),
    headerSize = bb.readShort(),
    size = bb.readInt(),
    stringCount = bb.readInt(),
    styleCount = bb.readInt(),
    flags = bb.readInt(),
    stringsStart = bb.readInt(),
    stylesStart = bb.readInt(),
    u16len,
    buffer;

  var isUTF_8 = (flags & 256) != 0;

  var offsets = new Array(stringCount);
  for (var i = 0; i < stringCount; ++i) {
    offsets[i] = bb.readInt();
  }

  var strings = new Array(stringCount);

  for (var i = 0; i < stringCount; ++i) {
    var pos = stringsStart + offsets[i];
    bb.offset = pos;

    strings[i] = "";

    if (isUTF_8) {
      u16len = bb.readUint8();

      if ((u16len & 0x80) != 0) {
        u16len = ((u16len & 0x7f) << 8) + bb.readUint8();
      }

      var u8len = bb.readUint8();
      if ((u8len & 0x80) != 0) {
        u8len = ((u8len & 0x7f) << 8) + bb.readUint8();
      }

      if (u8len > 0) {
        buffer = ResourceFinder.readBytes(bb, u8len);
        try {
          strings[i] = ByteBuffer.wrap(buffer, "utf8", true).toString("utf8");
        } catch (e) {
          if (DEBUG) {
            console.error(e);
            console.log("Error when turning buffer to utf-8 string.");
          }
        }
      } else {
        strings[i] = "";
      }
    } else {
      u16len = bb.readUint16();
      if ((u16len & 0x8000) != 0) {
        // larger than 32768
        u16len = ((u16len & 0x7fff) << 16) + bb.readUint16();
      }

      if (u16len > 0) {
        var len = u16len * 2;
        buffer = ResourceFinder.readBytes(bb, len);
        try {
          strings[i] = ByteBuffer.wrap(buffer, "utf8", true).toString("utf8");
        } catch (e) {
          if (DEBUG) {
            console.error(e);
            console.log("Error when turning buffer to utf-8 string.");
          }
        }
      }
    }

    if (DEBUG) {
      console.log("Parsed value: {0}", strings[i]);
    }
  }

  return strings;
};

/**
 *
 * @param {ByteBuffer} bb
 */
ResourceFinder.prototype.processTypeSpec = function(bb) {
  var type = bb.readShort(),
    headerSize = bb.readShort(),
    size = bb.readInt(),
    id = bb.readByte(),
    res0 = bb.readByte(),
    res1 = bb.readShort(),
    entryCount = bb.readInt();

  if (DEBUG) {
    console.log("Processing type spec " + this.typeStringPool[id - 1] + "...");
  }

  var flags = new Array(entryCount);

  for (var i = 0; i < entryCount; ++i) {
    flags[i] = bb.readInt();
  }
};

ResourceFinder.prototype.putIntoMap = function(resId, value) {
  if (this.responseMap[resId.toUpperCase()] == null) {
    this.responseMap[resId.toUpperCase()] = []
  }
  this.responseMap[resId.toUpperCase()].push(value)
};

module.exports = ResourceFinder;
