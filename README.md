## app-info-parser

[app-info-parser](https://github.com/chenquincy/app-info-parser) is writed for extracting information from APK and IPA file, which allows you to read the `AndroidManifest.xml` file in `.apk` file or `Info.plist` in `.ipa` file.

![](https://img.shields.io/npm/v/app-info-parser.svg) ![](https://img.shields.io/npm/dt/app-info-parser.svg) ![](https://img.shields.io/badge/language-javascript-yellow.svg)



## Support

* Node
* Browser



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

### Basic usage

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

> If you only need one Parser, look here.

#### ApkParser

``` javascript
const ApkParser = require('app-info-parser/src/apk')
const parser = new AppInfoParser('../packages/test.apk') // or xxx.ipa
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
const parser = new AppInfoParser('../packages/test.ipa') // or xxx.ipa
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(err => {
  console.log('err ----> ', err)
})
```



## API Referrer

### AppInfoParser | ApkParser | IpaParser

* **constructor(file)**
  * `file` Blob or File in browser, Path in Node
* **parse: () => Promise<Object>** parse file


