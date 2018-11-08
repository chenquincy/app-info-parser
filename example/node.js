const AppInfoParser = require('../')
const parser = new AppInfoParser('../packages/test.apk')
parser.parse().then(result => {
  console.log(' ----> ', result)
}).catch(e => {
  console.log('err ----> ', e)
})
