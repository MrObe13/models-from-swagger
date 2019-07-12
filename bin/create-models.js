#!/usr/bin/env node

const fs = require('fs');
require('@babel/polyfill');

// Packages
const path = require('path');
const commander = require('commander');

// Utils
const processFunc = require('../lib/processFunc');
const elabMain = require('../lib/elabMain');

commander
  .version('1.0.5')
  .option('-i, --inputPath <path>', 'Add input path from where the file will be read', getInputPath, [])
  .option('-u, --inputUrl <url>', 'Add input url', getInputUrl, [])
  .option('-o, --outputPath <path>', 'Add output path where write final js file')
  .option('-t, --type <type>', 'Choose format type between .js or .ts ', '.js')
  .parse(process.argv);

const outputFolder = path.resolve(commander.outputPath);
const { type } = commander;
checkDirectorySync(outputFolder);

const indexPath = `${outputFolder}/index.js`;
const outPutToDelete = `${outputFolder}/baseModel`;

elabMain.deleteJsFile(outPutToDelete);

fs.stat(indexPath, (err) => { // check if file exist in directory
  if (err === null) {
    if (commander.inputPath.length > 0) {
      (commander.inputPath).forEach((input) => {
        if (!input.href) {
          const obj = processFunc.jsonToObj(input);
          elabMain.elaborateModel(obj, outputFolder, type);
        }
      });
    } else if (commander.inputUrl.length > 0) {
      elaborateInputUrl(type);
    }
  } else if (commander.inputPath.length > 0) {
    (commander.inputPath).forEach((input) => {
      const obj = processFunc.jsonToObj(input);
      elabMain.elaborateModel(obj, outputFolder, type);
    });
  } else if (commander.inputUrl.length > 0) {
    elaborateInputUrl(type);
  }
});
console.log('----------------\n Input summary: ', process.argv);
console.log('----------------');

/**
 * This function return list of inputPath inserted in command line
 * @param val input String of line command
 * @param pathList empty array
 * @returns {Array} list of input paths inserted
 */
function getInputPath(val, pathList) {
  pathList.push(val);
  return pathList;
}

function getInputUrl(val, urlList) {
  urlList.push(val);
  return urlList;
}

function elaborateInputUrl(typeFile) {
  (commander.inputUrl).forEach(async (input) => {
    const obj = await processFunc.getUrlJson(input);
    elabMain.elaborateModel(obj, outputFolder, typeFile);
  });
}


function checkDirectorySync(directory) {
  try {
    fs.statSync(directory);
    try {
      fs.statSync(path.resolve(`${directory}/baseModel`));
    } catch (err) {
      fs.mkdirSync(`${directory}/baseModel`);

      console.log('   -------------------\n...Folders output create');
    }
    console.log('   -------------------\n...Folder parent output exist');
  } catch (e) {
    try {
      fs.mkdirSync(directory);
      fs.mkdirSync(`${directory}/baseModel`);

      console.log('   -------------------\n...Folders output create');
    } catch (er) {
      console.log('Error: ', er);
    }
  }
}
