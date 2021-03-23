import { Manifest } from './xml-parser/ManifestParser';

/**
 * find .apk file's icon path from json info
 * @param info // json info parsed from .apk file
 */
export function findApkIconPath(info: Manifest) {
  if (!info.application.icon?.length) {
    return '';
  }
  const rulesMap = {
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxdpi: 144,
    xxxhdpi: 192,
  };
  const resultMap = {} as Record<string, any>;
  const maxDpiIcon = { dpi: 120, icon: '' };
  for (const i in rulesMap) {
    if (Object.prototype.hasOwnProperty.call(rulesMap, i)) {
      const element = rulesMap[i as keyof typeof rulesMap];
      info.application.icon.some(({ value: icon }) => {
        if (icon && icon.indexOf(i) !== -1) {
          resultMap['application-icon-' + element] = icon;
          return true;
        }
        return false;
      });

      // get the maximal size icon
      if (
        resultMap['application-icon-' + element] &&
        element >= maxDpiIcon.dpi
      ) {
        maxDpiIcon.dpi = element;
        maxDpiIcon.icon = resultMap['application-icon-' + element];
      }
    }
  }

  if (Object.keys(resultMap).length === 0 || !maxDpiIcon.icon) {
    maxDpiIcon.dpi = 120;
    const [{ value = '' }] = info.application.icon || [{}];
    maxDpiIcon.icon = value;
    resultMap['applicataion-icon-120'] = maxDpiIcon.icon;
  }
  return maxDpiIcon.icon;
}
