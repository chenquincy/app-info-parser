import { Zip } from './utils/Zip';
import { ManifestParser } from './utils/xml-parser/ManifestParser';
import { ResourceFinder } from './utils/ResourceFinder';
import { mapInfoResource } from './utils/mapInfoResource';
import { findApkIconPath } from './utils/findApkIconPath';
import { getBase64FromBuffer } from './utils/getBase64FromBuffer';

const MANIFEST_NAME = /^androidmanifest\.xml$/;
const RESOURCE_NAME = /^resources\.arsc$/;

export class ApkParser extends Zip {
  constructor(file: string | File | Blob) {
    super(file);
    if (!(this instanceof ApkParser)) {
      return new ApkParser(file);
    }
  }

  public parse() {
    const entries = [MANIFEST_NAME, RESOURCE_NAME];
    const [MANIFEST_KEY, RESOURCE_KEY] = entries.map(entry => entry.toString());
    return new Promise((resolve, reject) => {
      this.getEntries(entries)
        .then((buffers: any) => {
          if (!buffers[MANIFEST_KEY]) {
            throw new Error("AndroidManifest.xml can't be found.");
          }
          const apkInfo = this.parseManifest(buffers[MANIFEST_KEY]);

          if (!buffers[RESOURCE_KEY]) {
            resolve(apkInfo);
          } else {
            // parse resourceMap
            const resourceMap = this.parseResourceMap(buffers[RESOURCE_KEY]);

            // update apkInfo with resourceMap
            const newApkInfo = mapInfoResource(apkInfo, resourceMap);

            // find icon path and parse icon
            const iconPath = findApkIconPath(apkInfo);
            if (iconPath) {
              this.getEntry(iconPath)
                .then((iconBuffer: any) => {
                  newApkInfo.icon = iconBuffer
                    ? getBase64FromBuffer(iconBuffer)
                    : null;
                })
                .catch(e => {
                  console.warn('[Warning] failed to parse icon: ', e);
                })
                .finally(() => {
                  newApkInfo.icon = null;
                  resolve(newApkInfo);
                });
            }
          }
        })
        .catch(reject);
    });
  }

  private parseManifest(buffer: Buffer) {
    try {
      const parser = new ManifestParser(buffer);
      return parser.parse();
    } catch (error) {
      throw new Error(`Parse AndroidManifest.xml error: ${error}`);
    }
  }

  private parseResourceMap(buffer: Buffer) {
    try {
      return new ResourceFinder().processResourceTable(buffer);
    } catch (e) {
      throw new Error('Parser resources.arsc error: ' + e);
    }
  }
}
