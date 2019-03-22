function objectType (o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

function isArray (o) {
  return objectType(o) === 'array'
}

function isObject (o) {
  return objectType(o) === 'object'
}

function isPrimitive (o) {
  return o === null || ['boolean', 'number', 'string', 'undefined'].includes(objectType(o))
}

function isBrowser () {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  )
}

/**
 * 根据resourceMap解析apkInfo中的文件位置
 * @param {Object} apkInfo // apk安装包解析出来的信息
 * @param {Object} resourceMap // resourceMap
 */
function mapInfoResource (apkInfo, resourceMap) {
  iteratorObj(apkInfo)
  return apkInfo
  function iteratorObj (obj) {
    for (var i in obj) {
      if (isArray(obj[i])) {
        iteratorArray(obj[i])
      } else if (isObject(obj[i])) {
        iteratorObj(obj[i])
      } else if (isPrimitive(obj[i])) {
        if (isResouces(obj[i])) {
          obj[i] = resourceMap[transKeyToMatchResourceMap(obj[i])]
        }
      }
    }
  }

  function iteratorArray (array) {
    const l = array.length
    for (let i = 0; i < l; i++) {
      if (isArray(array[i])) {
        iteratorArray(array[i])
      } else if (isObject(array[i])) {
        iteratorObj(array[i])
      } else if (isPrimitive(array[i])) {
        if (isResouces(array[i])) {
          array[i] = resourceMap[transKeyToMatchResourceMap(array[i])]
        }
      }
    }
  }

  function isResouces (attrValue) {
    if (!attrValue) return false
    if (typeof attrValue !== 'string') {
      attrValue = attrValue.toString()
    }
    return attrValue.indexOf('resourceId:') === 0
  }

  function transKeyToMatchResourceMap (resourceId) {
    return '@' + resourceId.replace('resourceId:0x', '').toUpperCase()
  }
}

/**
 * 查找 apk 文件解析信息中的 icon 文件位置
 * @param info // apk文件解析出来的信息
 */
function findApkInfoIcon (info) {
  if (info.application.icon && info.application.icon.splice) {
    const rulesMap = {
      mdpi: 48,
      hdpi: 72,
      xhdpi: 96,
      xxdpi: 144,
      xxxhdpi: 192
    }
    const resultMap = {}
    const maxDpiIcon = { dpi: 120, icon: '' }

    for (const i in rulesMap) {
      info.application.icon.some((icon) => {
        if (icon.indexOf(i) !== -1) {
          resultMap['application-icon-' + rulesMap[i]] = icon
          return true
        }
      })

      // 取出最大规格的icon
      if (
        resultMap['application-icon-' + rulesMap[i]] &&
        rulesMap[i] >= maxDpiIcon.dpi
      ) {
        maxDpiIcon.dpi = rulesMap[i]
        maxDpiIcon.icon = resultMap['application-icon-' + rulesMap[i]]
      }
    }

    if (Object.keys(resultMap).length === 0 || !maxDpiIcon.icon) {
      maxDpiIcon.dpi = 120
      maxDpiIcon.icon = info.application.icon[0] || ''
      resultMap['applicataion-icon-120'] = maxDpiIcon.icon
    }

    return maxDpiIcon.icon.split('\u0000').join('')
  } else {
    throw new Error('Unexpected icon type: ', info.application.icon)
  }
}

/**
 * 查找 ipa 文件解析信息中的 icon 文件位置
 * @param info // ipa文件解析出来的信息
 */
function findIpaInfoIcon (info) {
  if (
    info.CFBundleIcons &&
    info.CFBundleIcons.CFBundlePrimaryIcon &&
    info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles &&
    info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length
  ) {
    return info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles[info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length - 1]
  } else if (info.CFBundleIconFiles && info.CFBundleIconFiles.length) {
    return info.CFBundleIconFiles[info.CFBundleIconFiles.length - 1]
  } else {
    return '.app/Icon.png'
  }
}

/**
 * 将buffer转为base64编码
 * @param {Buffer} buffer
 */
function getBase64FromBuffer (buffer) {
  return 'data:image/png;base64,' + buffer.toString('base64')
}

module.exports = {
  isArray,
  isObject,
  isPrimitive,
  isBrowser,
  mapInfoResource,
  findApkInfoIcon,
  findIpaInfoIcon,
  getBase64FromBuffer
}
