import { isArray, isObject, isPrimitive } from './is';
import { Manifest } from './xml-parser/ManifestParser';

/**
 * map file place with resourceMap
 * @param {Object} apkInfo // json info parsed from .apk file
 * @param {Object} resourceMap // resourceMap
 */
export function mapInfoResource(apkInfo: Manifest, resourceMap: any): Manifest {
  iteratorObj(apkInfo);
  return apkInfo;
  function iteratorObj(obj: any) {
    for (var i in obj) {
      if (isArray(obj[i])) {
        iteratorArray(obj[i]);
      } else if (isObject(obj[i])) {
        iteratorObj(obj[i]);
      } else if (isPrimitive(obj[i])) {
        if (isResources(obj[i])) {
          obj[i] = resourceMap[transKeyToMatchResourceMap(obj[i])];
        }
      }
    }
  }

  function iteratorArray(array: any[]) {
    const l = array.length;
    for (let i = 0; i < l; i++) {
      if (isArray(array[i])) {
        iteratorArray(array[i]);
      } else if (isObject(array[i])) {
        iteratorObj(array[i]);
      } else if (isPrimitive(array[i])) {
        if (isResources(array[i])) {
          array[i] = resourceMap[transKeyToMatchResourceMap(array[i])];
        }
      }
    }
  }

  function isResources(attrValue: any) {
    if (!attrValue) return false;
    if (typeof attrValue !== 'string') {
      attrValue = attrValue.toString();
    }
    return attrValue.indexOf('resourceId:') === 0;
  }

  function transKeyToMatchResourceMap(resourceId: string) {
    return '@' + resourceId.replace('resourceId:0x', '').toUpperCase();
  }
}
