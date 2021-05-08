#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const AppInfoParser = require('../src')

const info = require('../package.json')

program
  .version(info.version, '-v --version')
  .option('-f --file-path <string>', 'The path of file that you want to parse')
  .option('-o --output-path <string>', 'The output path that you want to save the parse result')
  .parse(process.argv)

const options = program.opts()

if (options.filePath) {
  const jsPath = path.resolve(options.filePath)
  const parser = new AppInfoParser(jsPath)
  parser.parse().then(result => {
    const outputPath = options.outputPath || './result.json'
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
  })
}
if (Object.keys(options).length === 0) {
  console.warn('[app-info-parser] Cannot run without argument. Try to run "app-info-parser -f <file-path>".')
}
