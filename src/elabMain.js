

import fs from 'fs';
import mapValues from 'lodash/mapValues';
import path from 'path';
import Handlebars from 'handlebars';
import processFunc from './processFunc';
import handlebarsFunc from './handleBars/handlebarsHelper';

/**
 * @param pathToWriteFile path from -i command
 * @param extensionFile extension file type from -t command (default is js)
 * This function generate js files with models based on the object passed in arguments
 * @param obj Object to elaborate
 */
function elaborateModel(obj, pathToWriteFile, extensionFile) {
  handlebarsFunc(); // create custom function to elaborate hbs file

  const modelHbs = fs.readFileSync(path.join(__dirname, extensionFile === '.js' ? '../src/handleBars/modelJS.hbs' : '../src//handleBars/modelTS.hbs'), { encoding: 'UTF-8' });
  const modelExtended = fs.readFileSync(path.join(__dirname, '../src//handleBars/customModel.hbs'), { encoding: 'UTF-8' });

  const template = Handlebars.compile(modelHbs);
  const templateExtended = Handlebars.compile(modelExtended);

  const newObj = {};
  let customModelsCreated = 0;
  // const keycache = {};

  mapValues(obj.definitions, (modelDescriptor, key) => { // models
    newObj[key] = {};
    newObj[key].import = [];
    newObj[key].properties = modelDescriptor.properties;
    mapValues(modelDescriptor.properties, (propertyDescriptor, propertyName) => { // properties
      if (modelDescriptor.required && modelDescriptor.required.indexOf(propertyName) >= 0) {
        // eslint-disable-next-line no-param-reassign
        propertyDescriptor.required = true;
      }

      if (propertyDescriptor.$ref) { // only object contains $ref apply relative method
        newObj[key].properties[propertyName] = processFunc.transformRef(propertyDescriptor);

        const output = (propertyDescriptor.$ref).split('/').pop(); // add import value to array
        if (!newObj[key].import.includes(output)) { // check if current element is already present in array
          newObj[key].import.push(output);
        }
      } else {
        newObj[key].properties[propertyName] = propertyDescriptor;
      }

      mapValues(propertyDescriptor, (valueMap2, level2) => {
        if (valueMap2.$ref) {
          const output2 = (valueMap2.$ref).split('/').pop(); // add import value to array
          if (!newObj[key].import.includes(output2)) {
            newObj[key].import.push(output2);
          }
        }
        if (propertyDescriptor.additionalProperties) {
          newObj[key].properties[propertyName] = processFunc.transformObjItem(propertyDescriptor.additionalProperties, propertyDescriptor);
        } else if (propertyDescriptor.items) {
          newObj[key].properties[propertyName] = processFunc.transformArrayItem(propertyDescriptor.items, propertyDescriptor); // elaborate items $ref/enum
        } else if (!propertyDescriptor.$ref) { // if not an object elaborate in the previous cycle
          newObj[key].properties[propertyName][level2] = valueMap2;
        }
      });
    });
    Handlebars.registerHelper('getKey', () => key);
    const prefixClass = 'Base';
    const pathToWrite = path.join(`${pathToWriteFile}/baseModel/`, `${prefixClass + key + extensionFile}`); // dynamic path of files
    let model;

    if (processFunc.exists(pathToWrite) !== true) {
      model = template(newObj[key]);
    }
    writeJsFile(pathToWrite, model); // create baseModel
    customModelsCreated = createExtendedModel(pathToWriteFile, newObj, key, templateExtended, customModelsCreated, extensionFile); // create extendedModel
  });
  console.log(`...New Models created: ${customModelsCreated}`);
}

/**
 * Create models extended from baseModels
 * @param pathToWriteFile path to write
 * @param obj
 * @param fileName name of file
 * @param template
 * @param count
 */
function createExtendedModel(pathToWriteFile, obj, fileName, template, count, extensionType) {
  let model;
  const resolvePath = path.resolve(`${pathToWriteFile}/${fileName}${extensionType}`);

  if (processFunc.exists(resolvePath) !== true) {
    model = template(obj[fileName]);

    const indexPath = path.join(pathToWriteFile, 'index.js'); // static path of index.js export
    const exportString = `export { default as ${fileName} } from './${fileName}';\n`; // string to write in index.js file
    appendJsFile(indexPath, exportString); // write index.js file
    writeJsFile(resolvePath, model); // write model class
    // eslint-disable-next-line no-param-reassign
    count += 1;
  }
  return count;
}

/**
 *
 * @param pathToWrite Path where js fill will write
 * @param text Text to write. Can to be a string or hbs file.
 */
function appendJsFile(pathToWrite, text) {
  try {
    const filePath = path.resolve(pathToWrite);
    fs.appendFileSync(filePath, text);
  } catch (err) {
    console.log(`APPEND ERROR: ${err}`);
  }
}

/**
 *
 * @param pathToWrite Path where js fill will write
 * @param text Text to write. Can to be a string or hbs file.
 */
function writeJsFile(pathToWrite, text) {
  const filePath = path.resolve(pathToWrite);
  try {
    fs.writeFileSync(filePath, text);
  } catch (err) {
    console.log(`WRITE ERROR: ${err}`);
  }
}


/**
 * Use this to delete all files in a folder
 * @param pathToDelete
 */
function deleteJsFile(pathToDelete) {
  const filePath = path.resolve(pathToDelete);
  try {
    const files = fs.readdirSync(filePath);
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const outPutResolved = path.resolve(`${filePath}/${file}`);
      fs.unlinkSync(outPutResolved);
    }
    console.log('...Folder of baseModel cleaned successfully');
  } catch (err) {
    console.log(`WRITE ERROR: ${err}`);
  }
}


module.exports = {
  writeJsFile,
  deleteJsFile,
  elaborateModel,
};
