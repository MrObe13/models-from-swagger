import fs from 'fs';
import fetch from 'node-fetch';
import mapValues from 'lodash/mapValues';
import map from 'lodash/map';
import path from 'path';

/**
 * Check if path exist
 * True: exist
 * False: not exist
 * @param {string} currentPath
 * @returns {boolean}
 */
function exists(currentPath) {
  try {
    return !!fs.statSync(currentPath);
  } catch (e) {
    return false;
  }
}

/**
 * * Elaborate input data in js object
 * @param {string} paths of json input file
 */
function jsonToObj(paths) {
  const filePath = path.resolve(paths);
  const res = fs.readFileSync(filePath);
  return JSON.parse(res);
}

/**
 * Use to split string withs '/' and take last element
 * @param {string} inputString string to elaborate
 * @returns {string}
 */
function splitRef(inputString) {
  return inputString.split('/').pop();
}

/**
 * Use this to download JSON object from url
 * @param url Url of JSON data
 * @returns {Promise<Response>}
 */
async function getUrlJson(url) {
  return fetch(url)
    .then((res) => res.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/**
 * Function that transform a particular object tree. Based on key "$ref"
 * Example of object: { "$ref": "#/definitions/Bob" }
 * @param {object} obj object to elaborate
 * @returns {object} new object with tree based on obj input
 */
function transformRef(obj) {
  const res = { ...obj };
  delete res.$ref;
  res.type = `$${splitRef(obj.$ref)}$`;
  return res;
}


/**
 * Function that transform a particular object tree. Based on key "$ref" & "enum" & "type"
 * Example of object: { "type": "array" (by objFather), "items": {"$ref": "#/definitions/Bob"}
 * @param {object} obj from get data
 * @param objFather Used to pick high level value to build new object tree
 * @returns {object} new object with tree based on obj input
 */
function transformArrayItem(obj, objFather) {
  let finalObj;
  let elabObj;
  mapValues(obj, (value, key) => {
    switch (key) {
      case '$ref':
        elabObj = splitRef(obj.$ref);
        finalObj = ({ type: objFather.type, itemType: `$${elabObj}$` });
        break;
      case 'enum':
        elabObj = value;
        finalObj = ({ type: objFather.type, itemType: obj });
        break;
      case 'type':
        if (value === 'array') {
          const arrayObj = transformArrayItem(obj.items, obj);
          finalObj = ({ type: objFather.type, itemType: arrayObj });
        } else {
          elabObj = value;
          finalObj = ({ type: objFather.type, itemType: obj });
        }
        break;
      default:
    }
  });
  return finalObj;
}

/**
 * Function that transform a particular object tree. Based on key "$ref" & "enum"
 * Example of object: { "type": "object" (by objFather), "additionalProperties": {"$ref": "#/definitions/Bob"}
 * @param {object} obj from get data
 * @param objFather Used to pick high level value to build new object tree
 * @returns {object} new object with tree based on obj input
 */
function transformObjItem(obj, objFather) {
  let finalObj;
  let elabObj;
  mapValues(obj, (value, key) => {
    switch (key) {
      case '$ref':
        elabObj = splitRef(obj.$ref);
        finalObj = ({ type: objFather.type, itemType: `$${elabObj}$` });
        break;
      // case "enum":
      //     elabObj = value;
      //     finalObj = ({type: objFather.type, itemType: obj});
      //     break;
      case 'type':
        if (value === 'array') {
          const arrayObj = transformArrayItem(obj.items, obj);
          finalObj = ({ type: objFather.type, itemType: arrayObj });
        } else {
          elabObj = value;
          finalObj = ({ type: objFather.type, itemType: obj });
        }
        break;
      default:
    }
  });
  return finalObj;
}

/**
 * This function create an array of sub-object definitions
 * @param {object} obj to elaborate
 * @returns {Array}
 */
function getDefinitions(obj) {
  const def = [];
  map(obj.definitions, (value, key) => {
    def.push(key);
  });
  return def;
}

module.exports = {
  jsonToObj,
  getUrlJson,
  getDefinitions,
  transformArrayItem,
  transformObjItem,
  transformRef,
  exists,
};
