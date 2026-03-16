'use strict';

function _isObject(value) {
  return typeof value === 'object' && value !== null;
}

function _isArray(value) {
  return Array.isArray(value);
}

function _isString(value) {
  return typeof value === 'string';
}

function _isUndefined(value) {
  return typeof value === 'undefined';
}

function _isNumber(value) {
  return typeof value === 'number';
}

function _isBoolean(value) {
  return typeof value === 'boolean';
}

function _isDate(value) {
  return value instanceof Date;
}

const PATH_RE = /[\$\w-|:]+|\[\]|([^\[[\w]\]]|["'](.*?)['"])/g;
const PROTO_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

class DataObjectParser {
  constructor($data) {
    this._data = $data || {};
  }

  /**
   * Given a dot delimited string set will create an object
   * based on the structure of the string with the desired value
   *
   * @param {String} $path  path indicating where value should be placed
   * @param {Mixed} $value  the value desired to be set at the location determined by path
   */
  set($path, $value) {
    if (!$path || $path === '') return undefined;

    const pathList = $path.match(PATH_RE);
    let parent = this._data;
    let parentKey;
    let grandParent = null;
    let grandParentKey = null;

    const addObj = ($obj, $key, $data) => {
      if ($key === '[]') {
        $obj.push($data);
      } else {
        $obj[$key] = $data;
      }
    };

    while (pathList.length > 0) {
      parentKey = pathList.shift().replace(/["']/g, '');

      // Prevent prototype pollution
      if (PROTO_KEYS.has(parentKey)) {
        throw new Error('Prototype pollution attempt detected');
      }

      // Number: treat as array index
      if (!isNaN(+parentKey) || parentKey === '[]') {
        if (!_isArray(parent)) {
          parent = [];
          addObj(grandParent, grandParentKey, parent);
        }

        // String: treat as object key
      } else if (_isString(parentKey)) {
        if (!_isObject(parent)) {
          parent = {};
          addObj(grandParent, grandParentKey, parent);
        }
      }

      grandParent = parent;
      grandParentKey = parentKey;
      parent = parent[parentKey];
    }

    addObj(grandParent, grandParentKey, $value);
    return this;
  }

  /**
   * Returns the value defined by the path passed in
   *
   * @param  {String} $path string leading to a desired value
   * @return {Mixed}        a value in an object
   */
  get($path) {
    let data = this._data;
    if (!$path) return undefined;

    const paths = $path.match(PATH_RE);
    while (typeof data !== 'undefined' && paths.length > 0) {
      if (data.propertyIsEnumerable(paths[0].replace(/"/g, ''))) {
        data = data[paths.shift().replace(/"/g, '')];
      } else {
        return undefined;
      }
    }
    return data;
  }

  data($data) {
    if (!_isUndefined($data)) {
      this._data = $data;
      return this;
    }
    return this._data;
  }

  /**
   * "Transposes" data; receives flat data and returns structured
   *
   * @param  {Object}           $flat Flat dot-notation object
   * @return {DataObjectParser} An instance of a DataObjectParser
   */
  static transpose($flat) {
    const parser = new DataObjectParser();
    for (const n in $flat) {
      if ($flat[n] !== undefined) {
        parser.set(n, $flat[n]);
      }
    }
    return parser;
  }

  /**
   * "Untransposes" data object; opposite of transpose
   *
   * @param  {Mixed}  $structured A Object or a DataObjectParser
   * @return {Object}             Flat object
   */
  static untranspose($structured) {
    $structured = $structured || {};
    const structuredData = $structured._data || $structured;

    const traverse = ($data, $isIndex) => {
      const result = [];

      const createMapHandler = ($name) => ($item) => {
        const name = /\./.test($name) ? '["' + $name + '"]' : $name;
        $item.key.unshift(name + '.');
        return { key: $item.key, data: $item.data };
      };

      for (const name in $data) {
        let modifiedName = $isIndex ? '[' + name + ']' : name;

        if (_isString($data[name]) || _isNumber($data[name]) || $data[name] === null || _isBoolean($data[name]) || _isDate($data[name])) {
          if (/\./.test(name)) modifiedName = '["' + name + '"]';
          result.push({ key: [modifiedName], data: $data[name] });

        } else if (_isArray($data[name])) {
          result.push(...traverse($data[name], true).map(createMapHandler(modifiedName)));

        } else if (_isObject($data[name])) {
          result.push(...traverse($data[name], false).map(createMapHandler(modifiedName)));
        }
      }
      return result;
    };

    const flatArray = traverse(structuredData, false);
    const flatObj = {};

    flatArray.forEach(($item) => {
      for (let i = 0; i < $item.key.length - 1; i++) {
        if (/^\[/.test($item.key[i + 1])) {
          $item.key[i] = $item.key[i].replace(/\.$/, '');
        }
      }
      flatObj[$item.key.join('')] = $item.data;
    });

    return flatObj;
  }
}

module.exports = DataObjectParser;
