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



### NPM Use

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
    console.log('file buffer ----> ', parser.file)
  }).catch(err => {
    console.log('err ----> ', err)
  })
}
</script>
```

