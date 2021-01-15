/**
 * get file extension
 *
 * @param str - file name string
 */
export function getExtensionName(str: string): string {
  const reg = /\.([^\.]+)$/;
  const matched = reg.exec(str);
  if (matched) {
    return matched[1];
  }

  return '';
}
