import plist from 'plist';
import bplist from 'bplist-parser';
import cgbiToPng from 'cgbi-to-png';
import { Zip } from './utils/Zip';
import { getBase64FromBuffer } from './utils/getBase64FromBuffer';
import { isBrowser } from './utils/is';
import { findIpaIconPath } from './utils/findIpaIconPath';

import { IpaInfoType } from './types';

const PLIST_NAME = /payload\/.+?\.app\/info.plist$/;
const PROVISION_NAME = /payload\/.+?\.app\/embedded.mobileprovision/;

export default class IpaParser extends Zip {
  /**
   * parser for parsing .ipa file
   * @param {String | File | Blob} file // file's path in Node, instance of File or Blob in Browser
   */
  constructor(file: string | File | Blob) {
    super(file);
    if (!(this instanceof IpaParser)) {
      return new IpaParser(file);
    }
  }

  parse(): Promise<IpaInfoType> {
    const entries = [PLIST_NAME, PROVISION_NAME];
    const [PLIST_KEY, PROVISION_KEY] = entries.map(entry => entry.toString());
    return new Promise<IpaInfoType>((resolve, reject) => {
      this.getEntries(entries)
        .then((buffers: any) => {
          if (!buffers[PLIST_NAME.toString()]) {
            throw new Error("Info.plist can't be found.");
          }

          const plistInfo = this.parsePlist(buffers[PLIST_KEY]);
          // parse mobile provision
          const provisionInfo = this.parseProvision(buffers[PROVISION_KEY]);
          plistInfo.mobileProvision = provisionInfo;

          // find icon path and parse icon
          const iconRegex = new RegExp(
            findIpaIconPath(plistInfo).toLowerCase()
          );
          this.getEntry(iconRegex)
            .then(iconBuffer => {
              try {
                // In general, the ipa file's icon has been specially processed, should be converted
                plistInfo.icon = iconBuffer
                  ? getBase64FromBuffer(cgbiToPng.revert(iconBuffer))
                  : null;
              } catch (err) {
                if (isBrowser()) {
                  // Normal conversion in other cases
                  plistInfo.icon = iconBuffer
                    ? getBase64FromBuffer(
                        // @ts-ignore
                        window.btoa(String.fromCharCode(...iconBuffer))
                      )
                    : null;
                } else {
                  plistInfo.icon = null;
                  console.warn('[Warning] failed to parse icon: ', err);
                }
              }
              resolve(plistInfo);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /**
   * Parse plist
   * @param {Buffer} buffer // plist file's buffer
   */
  private parsePlist(buffer: Buffer | string): any {
    let result;
    const bufferType = buffer[0];
    if (bufferType === 60 || bufferType === '<' || bufferType === 239) {
      result = plist.parse(buffer.toString());
    } else if (bufferType === 98) {
      result = bplist.parseBuffer(buffer)[0];
    } else {
      throw new Error('Unknown plist buffer type.');
    }
    return result;
  }

  /**
   * parse provision
   * @param {Buffer} buffer // provision file's buffer
   */
  private parseProvision(buffer: Buffer): any {
    let info = {};
    if (buffer) {
      let content = buffer.toString('utf-8');
      const firstIndex = content.indexOf('<?xml');
      const endIndex = content.indexOf('</plist>');
      content = content.slice(firstIndex, endIndex + 8);
      if (content) {
        info = plist.parse(content);
      }
    }
    return info;
  }
}
