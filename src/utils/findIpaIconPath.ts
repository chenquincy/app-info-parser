/**
 * find .ipa file's icon path from json info
 * @param info // json info parsed from .ipa file
 */
export function findIpaIconPath(info: any) {
  if (
    info.CFBundleIcons &&
    info.CFBundleIcons.CFBundlePrimaryIcon &&
    info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles &&
    info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length
  ) {
    return info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles[
      info.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length - 1
    ];
  } else if (info.CFBundleIconFiles && info.CFBundleIconFiles.length) {
    return info.CFBundleIconFiles[info.CFBundleIconFiles.length - 1];
  } else {
    return '.app/Icon.png';
  }
}
