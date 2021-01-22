export function objectType(o: any) {
  return Object.prototype.toString
    .call(o)
    .slice(8, -1)
    .toLowerCase();
}

export function isArray(o: any) {
  return objectType(o) === 'array';
}

export function isObject(o: any) {
  return objectType(o) === 'object';
}

export function isPrimitive(o: any) {
  return (
    o === null ||
    ['boolean', 'number', 'string', 'undefined'].includes(objectType(o))
  );
}

export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
