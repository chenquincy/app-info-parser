export enum ExtensionNameEnum {
  IPA = 0,
  APK = 1,
  OTHER = -1,
}
/**
 * get file extension
 * @param str - file name string
 */
export function getExtensionName(str: string): ExtensionNameEnum {
  const reg = /\.([^\.]+)$/;
  const matched = reg.exec(str);
  if (matched) {
    const name = matched[1];
    if (name === 'ipa') {
      return ExtensionNameEnum.IPA;
    } else if (name === 'apk') {
      return ExtensionNameEnum.APK;
    }
  }

  return ExtensionNameEnum.OTHER;
}
