import Unzip from 'isomorphic-unzip';
import { isBrowser } from './is';

export abstract class Zip {
  public file: string | File | Blob;
  public unzip: any;

  constructor(file: string | File | Blob) {
    if (isBrowser() && file instanceof Blob && file.size) {
      this.file = file;
    } else if (typeof file === 'string') {
      this.file = require('path').resolve(file);
    } else {
      throw new Error(
        'Param error: [file] must be file path in Node or an instance of Blob or File in browser'
      );
    }

    this.unzip = new Unzip(this.file);
  }

  abstract parse(): Promise<any>;

  getEntries(
    regexps: RegExp[],
    type = 'buffer'
  ): Promise<Record<string, Buffer>> {
    const regexpStrings = regexps.map(regex => {
      if (typeof regex === 'string') {
        return String(regex).trim();
      }
      return regex;
    });

    return new Promise((resolve, reject) => {
      this.unzip.getBuffer(
        regexpStrings,
        { type },
        (err: any, buffers: Record<string, Buffer>) => {
          err ? reject(err) : resolve(buffers);
        }
      );
    });
  }

  getEntry(regex: RegExp | string, type = 'buffer'): Promise<Buffer> {
    const regexString = regex.toString().trim();

    return new Promise((resolve, reject) => {
      this.unzip.getBuffer(
        [regexString],
        { type },
        (err: any, buffers: Buffer) => {
          err ? reject(err) : resolve(buffers);
        }
      );
    });
  }
}
