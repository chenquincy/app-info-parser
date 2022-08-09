## app-info-parser

[app-info-parser](https://github.com/chenquincy/app-info-parser) is a parser for parsing `.ipa` or `.apk` files. It will return the information with json from `AndroidManifest.xml` or `Info.plist`.

![](https://img.shields.io/npm/v/app-info-parser.svg) ![](https://img.shields.io/npm/dt/app-info-parser.svg) ![](https://img.shields.io/badge/language-javascript-yellow.svg)

## Support

* Node ✅

* Browser 

  | ![Chrome](https://camo.githubusercontent.com/26846e979600799e9f4273d38bd9e5cb7bb8d6d0/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6368726f6d652f6368726f6d655f34387834382e706e67) | ![Firefox](https://camo.githubusercontent.com/6087557f69ec6585eb7f8d7bd7d9ecb6b7f51ba1/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f66697265666f782f66697265666f785f34387834382e706e67) | ![Safari](https://camo.githubusercontent.com/6fbaeb334b99e74ddd89190a42766ea3b4600d2c/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f7361666172692f7361666172695f34387834382e706e67) | ![Opera](https://camo.githubusercontent.com/96d2405a936da1fb8988db0c1d304d3db04b8a52/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f6f706572612f6f706572615f34387834382e706e67) | ![IE](https://camo.githubusercontent.com/4b062fb12353b0ef8420a72ddc3debf6b2ee5747/68747470733a2f2f7261772e6769746875622e636f6d2f616c7272612f62726f777365722d6c6f676f732f6d61737465722f7372632f617263686976652f696e7465726e65742d6578706c6f7265725f392d31312f696e7465726e65742d6578706c6f7265725f392d31315f34387834382e706e67) |
  | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
  |                           latest ✅                           |                           latest ✅                           |                           latest ✅                           |                           latest ✅                           |                              ❌                               |

- npx

## Installation

``` shell
npm install app-info-parser
# or yarn
yarn add app-info-parser
```

## Getting started

### NPX Use

You can use app-info-parser by npx, if you don't want to install it. Run this command in your terminal:

``` shell
npx app-info-parser -f <file-path> -o <output-path>
```

| argument | type   | description                                                  |
| -------- | ------ | ------------------------------------------------------------ |
| -f       | string | The path of file that you want to parse.                     |
| -o       | string | The output path that you want to save the parse result. Default is "./result.json" |

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

### CDN Use

``` html
<input type="file" name="file" id="file" onchange="fileSelect()">
<script src="//unpkg.com/browse/app-info-parser/dist/app-info-parser.min.js"></script>
<script>
function fileSelect () {
  const files = document.getElementById('file').files
  const parser = new window.AppInfoParser(files[0])
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

## Buy Me A Coffee

Open source is not easy, you can  buy me a coffee. *Note your name or github id so I can add you to the donation list.*

<table style="margin-left: auto; margin-right: auto;">
	<tr>
		<td style="padding: 50px;text-align:center;">
      <p style="font-size:25px;">Wechat Pay</p>
			<img src="https://user-images.githubusercontent.com/10976378/61703600-7e66f900-ad74-11e9-9eab-9ec57d1cf7e0.png">
		</td>
		<td style="padding: 50px;text-align:center;">
      <p style="font-size:25px;">Ali Pay</p>
			<img src="https://user-images.githubusercontent.com/10976378/61703625-9179c900-ad74-11e9-936c-9cf5b7d59aa7.png">
		</td>
	</tr>
</table>

## Donation List

❤️ Thanks these guys for donations. Contact me with <a href="mailto:mail@quincychen.cn" target="_blank" rel="noopener noreferrer nofollow" title="EMail">email</a>, if you had donated but not on the list.

| Donors                                 | Amount | Time             |
| -------------------------------------- | ------ | ---------------- |
| *明                                    | ￥100  | 2021-06-17 17:29 |
| =*=                                    | ￥6.66 | 2021-05-24 15:12 |
| *学                                    | ￥6.66 | 2021-01-08 15:32 |
| y*n                                    | ￥6.66 | 2020-08-26 12:10 |
| *明                                    | ￥100  | 2020-08-25 11:35 |
| *肖                                    | ￥6.66 | 2020-07-31 19:54 |
| O*s                                    | ￥1    | 2020-05-26 16:01 |
| **豪                                   | ￥6.66 | 2020-03-05 20:14 |
| *大                                    | ￥6.66 | 2020-02-25 16:55 |
| *风                                    | ￥1    | 2020-01-03 15:36 |
| [黄灰红](https://github.com/LoranWong) | ￥1    | 2019-12-10 17:53 |
| zona.zhou                              | ￥1    | 2019-10-20 23:18 |
| *。                                    | ￥66   | 2019-10-20 22:45 |

##  License

MIT

## Resources

* [Changelog](https://github.com/chenquincy/app-info-parser/blob/master/CHANGELOG.md)

## FAQ

### Build/Parse error with vite？

See this [issue](https://github.com/vitejs/vite/issues/2985) of vite, vite is not going support node global builtins and node specific api's on the client. Some of app-info-parser's deps didn't support browser env, most of them without maintain, so it can't be resolved.

Just use app-info-parser by CDN using(import by script element), don't use it with module import in vite.

