/**
 * 去除unicode空字符
 *
 * @param str
 */
function decodeNullUnicode<T extends string | RegExp>(str: T) {
  if (typeof str === 'string') {
    return str.replace(/\u0000/g, '');
  }
  return str;
}
