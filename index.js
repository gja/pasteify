"use strict";

var fs              = require("fs");
var fspath          = require("path");
var jstransform     = require('jstransform');
var utils           = require('jstransform/src/utils');
var transform       = jstransform.transform;
var Syntax          = jstransform.Syntax;
var through         = require('through');

function replacePasteify(file) {
  var f = function(traverse, node, path, state) {
    // TODO: Ensure the file exists.
    // TODO: Raise an error if the file is not a literal
    var pasted = node.arguments[0].value;
    utils.append(fs.readFileSync(fspath.resolve(fspath.dirname(file), pasted)), state);
    utils.move(node.range[1], state);
  }

  f.test = function(node, path, state) {
    return node.type === Syntax.CallExpression &&
      node.callee.type === Syntax.Identifier &&
      node.callee.name === 'pasteify';
  }

  return f;
}
function process(file, isJSXFile, transformer) {
  var data = '';
  function write(chunk) {
    return data += chunk;
  }

  function compile() {
    // jshint -W040
    if (isJSXFile) {
      try {
        var transformed = transformer(data);
        this.queue(transformed);
      } catch (error) {
        error.name = 'PastifyError';
        error.message = file + ': ' + error.message;
        error.fileName = file;

        this.emit('error', error);
      }
    } else {
      this.queue(data);
    }
    return this.queue(null);
    // jshint +W040
  }

  return through(write, compile);
}

function getExtensionsMatcher(extensions) {
  return new RegExp('\\.(' + extensions.join('|') + ')$');
}

module.exports = function(file, options) {
  options = options || {};

  var isJSXFile;

  if (options.everything) {
    isJSXFile = true;
  } else {
    var extensions = ['js', 'jsx']
      .concat(options.extension)
      .concat(options.x)
      .filter(Boolean)
      .map(function(ext) { return ext[0] === '.' ? ext.slice(1) : ext });
    isJSXFile = getExtensionsMatcher(extensions).exec(file);
  }

  var transformVisitors = [replacePasteify(file)];

  function transformer(source) {
    // Stripping types needs to happen before the other transforms
    return transform(transformVisitors, source).code;
  }

  return process(file, isJSXFile, transformer);
};
