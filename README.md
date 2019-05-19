## app-info-parser

[app-info-parser](https://github.com/chenquincy/app-info-parser) is a parser for parsing `.ipa` or `.apk` files. It will return the infomation with json from `AndroidManifest.xml` or `Info.plist`.

![](https://img.shields.io/npm/v/app-info-parser.svg) ![](https://img.shields.io/npm/dt/app-info-parser.svg) ![](https://img.shields.io/badge/language-javascript-yellow.svg)



## Support

* Node ✅

* Browser 

  | ![Chrome](https://camo.githubusercontent.com/26846e979600799e9f4273d38bd9e5cb7bb8d6d0/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6368726f6d652f6368726f6d655f34387834382e706e67) | ![Firefox](https://camo.githubusercontent.com/6087557f69ec6585eb7f8d7bd7d9ecb6b7f51ba1/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f66697265666f782f66697265666f785f34387834382e706e67) | ![Safari](https://camo.githubusercontent.com/6fbaeb334b99e74ddd89190a42766ea3b4600d2c/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f7361666172692f7361666172695f34387834382e706e67) | ![Opera](https://camo.githubusercontent.com/96d2405a936da1fb8988db0c1d304d3db04b8a52/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6f706572612f6f706572615f34387834382e706e67) | ![IE](https://camo.githubusercontent.com/4b062fb12353b0ef8420a72ddc3debf6b2ee5747/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f617263686976652f696e7465726e65742d6578706c6f7265725f392d31312f696e7465726e65742d6578706c6f7265725f392d31315f34387834382e706e67) |
  | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
  |                           latest ✅                           |                           latest ✅                           |                           latest ✅                           |                           latest ✅                           |                              ❌                               |



## Installation

``` shell
npm install app-info-parser
# or yarn
yarn add app-info-parser
```



## Getting started

### NPM Use

``` javascript
const AppInfoParser = require('app-info-parser')
const parser = new AppInfoParser('../packages/test.apk') // or xxx.ipa
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(err => {
  console.log('err ----> ', err)
})
```

### Basic Use

``` html
<input type="file" name="file" id="file" onchange="fileSelect()">
<script src="/dist/app-info-parser.js"></script>
<script>
function fileSelect () {
  const files = document.getElementById('file').files
  const parser = new AppInfoParser(files[0])
  parser.parse().then(result => {
    console.log('app info ----> ', result)
    console.log('icon base64 ----> ', result.icon)
  }).catch(err => {
    console.log('err ----> ', err)
  })
}
</script>
```

### Demand loading

> You can use demand loading, when you only need one parser.

#### ApkParser

``` javascript
const ApkParser = require('app-info-parser/src/apk')
const parser = new ApkParser('../packages/test.apk')
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(err => {
  console.log('err ----> ', err)
})
```

#### IpaParser

``` javascript
const IpaParser = require('app-info-parser/src/ipa')
const parser = new IpaParser('../packages/test.ipa')
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(err => {
  console.log('err ----> ', err)
})
```



## API Referrer

### AppInfoParser | ApkParser | IpaParser

* `constructor(file)`
  * `file`   Blob or File in browser, Path in Node
* `parse: () => Promise<Object>`   A function return a promise, which resolving the parse result



##  License

MIT



## Resources

* [Changelog](https://github.com/chenquincy/app-info-parser/blob/master/CHANGELOG.md)

