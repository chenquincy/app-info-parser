## app-info-parser

**app-info-parser** is writed for extracting information from APK and IPA file, which allows you to read the `AndroidManifest.xml` file in `xxx.apk` file or `Info.plist` in `xxx.ipa` file.

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

``` javascript
const AppInfoParser = require('app-info-parser')
const parser = new AppInfoParser('../packages/test.apk') // or xxx.ipa
parser.parse().then(result => {
  console.log('app info ----> ', result)
  console.log('file buffer ----> ', parser.file)
}).catch(err => {
  console.log('err ----> ', err)
})
```

## Q & A

* Error in webpack:  `* fs in ../app-info-parser/~/bplist-parser/bplistParser.js To install it, you can run: npm install --save fs`

``` javascript
// Add this option to build/webpack.base.conf.js
node: {
    fs: 'empty'
}
```

