const AppInfoParser = require('../src/index')
const IpaParser = require('../src/ipa')
const ApkParser = require('../src/apk')

// AppInfoParser parse apk
const apkInfoParser = new AppInfoParser('../packages/test.apk')
apkInfoParser.parse().then(result => {
  console.log('info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(e => {
  console.log('err ----> ', e)
})

// AppInfoParser parse ipa
const ipaInfoParser = new AppInfoParser('../packages/test.ipa')
ipaInfoParser.parse().then(result => {
  console.log('info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(e => {
  console.log('err ----> ', e)
})

// IpaParser
const ipaParser = new IpaParser('../packages/test.ipa')
ipaParser.parse().then(result => {
  console.log('info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(e => {
  console.log('err ----> ', e)
})

// ApkParser
const apkParser = new ApkParser('../packages/test.apk')
apkParser.parse().then(result => {
  console.log('info ----> ', result)
  console.log('icon base64 ----> ', result.icon)
}).catch(e => {
  console.log('err ----> ', e)
})
