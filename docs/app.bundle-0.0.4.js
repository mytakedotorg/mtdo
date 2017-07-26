/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 80);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(32)
var ieee754 = __webpack_require__(53)
var isArray = __webpack_require__(25)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = __webpack_require__(14);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(4);
util.inherits = __webpack_require__(0);
/*</replacement>*/

var Readable = __webpack_require__(26);
var Writable = __webpack_require__(15);

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

//Types of elements found in the DOM
module.exports = {
	Text: "text", //Text
	Directive: "directive", //<? ... ?>
	Comment: "comment", //<!-- ... -->
	Script: "script", //<script> tags
	Style: "style", //<style> tags
	Tag: "tag", //Any tag
	CDATA: "cdata", //<![CDATA[ ... ]]>
	Doctype: "doctype",

	isTag: function(elem){
		return elem.type === "tag" || elem.type === "script" || elem.type === "style";
	}
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Parser = __webpack_require__(22),
    DomHandler = __webpack_require__(35);

function defineProp(name, value){
	delete module.exports[name];
	module.exports[name] = value;
	return value;
}

module.exports = {
	Parser: Parser,
	Tokenizer: __webpack_require__(23),
	ElementType: __webpack_require__(5),
	DomHandler: DomHandler,
	get FeedHandler(){
		return defineProp("FeedHandler", __webpack_require__(50));
	},
	get Stream(){
		return defineProp("Stream", __webpack_require__(52));
	},
	get WritableStream(){
		return defineProp("WritableStream", __webpack_require__(24));
	},
	get ProxyHandler(){
		return defineProp("ProxyHandler", __webpack_require__(51));
	},
	get DomUtils(){
		return defineProp("DomUtils", __webpack_require__(37));
	},
	get CollectingHandler(){
		return defineProp("CollectingHandler", __webpack_require__(49));
	},
	// For legacy support
	DefaultHandler: DomHandler,
	get RssHandler(){
		return defineProp("RssHandler", this.FeedHandler);
	},
	//helper methods
	parseDOM: function(data, options){
		var handler = new DomHandler(options);
		new Parser(handler, options).end(data);
		return handler.dom;
	},
	parseFeed: function(feed, options){
		var handler = new module.exports.FeedHandler(options);
		new Parser(handler, options).end(feed);
		return handler.dom;
	},
	createDomStream: function(cb, options, elementCb){
		var handler = new DomHandler(cb, options, elementCb);
		return new Parser(handler, options);
	},
	// List of all events that the parser emits
	EVENTS: { /* Format: eventname: number of arguments */
		attribute: 2,
		cdatastart: 0,
		cdataend: 0,
		text: 1,
		processinginstruction: 2,
		comment: 1,
		commentend: 0,
		closetag: 1,
		opentag: 2,
		opentagname: 1,
		error: 1,
		end: 0
	}
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 8 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var buffer = __webpack_require__(1);
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Abreve": "Ă",
	"abreve": "ă",
	"ac": "∾",
	"acd": "∿",
	"acE": "∾̳",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"Acy": "А",
	"acy": "а",
	"AElig": "Æ",
	"aelig": "æ",
	"af": "⁡",
	"Afr": "𝔄",
	"afr": "𝔞",
	"Agrave": "À",
	"agrave": "à",
	"alefsym": "ℵ",
	"aleph": "ℵ",
	"Alpha": "Α",
	"alpha": "α",
	"Amacr": "Ā",
	"amacr": "ā",
	"amalg": "⨿",
	"amp": "&",
	"AMP": "&",
	"andand": "⩕",
	"And": "⩓",
	"and": "∧",
	"andd": "⩜",
	"andslope": "⩘",
	"andv": "⩚",
	"ang": "∠",
	"ange": "⦤",
	"angle": "∠",
	"angmsdaa": "⦨",
	"angmsdab": "⦩",
	"angmsdac": "⦪",
	"angmsdad": "⦫",
	"angmsdae": "⦬",
	"angmsdaf": "⦭",
	"angmsdag": "⦮",
	"angmsdah": "⦯",
	"angmsd": "∡",
	"angrt": "∟",
	"angrtvb": "⊾",
	"angrtvbd": "⦝",
	"angsph": "∢",
	"angst": "Å",
	"angzarr": "⍼",
	"Aogon": "Ą",
	"aogon": "ą",
	"Aopf": "𝔸",
	"aopf": "𝕒",
	"apacir": "⩯",
	"ap": "≈",
	"apE": "⩰",
	"ape": "≊",
	"apid": "≋",
	"apos": "'",
	"ApplyFunction": "⁡",
	"approx": "≈",
	"approxeq": "≊",
	"Aring": "Å",
	"aring": "å",
	"Ascr": "𝒜",
	"ascr": "𝒶",
	"Assign": "≔",
	"ast": "*",
	"asymp": "≈",
	"asympeq": "≍",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"awconint": "∳",
	"awint": "⨑",
	"backcong": "≌",
	"backepsilon": "϶",
	"backprime": "‵",
	"backsim": "∽",
	"backsimeq": "⋍",
	"Backslash": "∖",
	"Barv": "⫧",
	"barvee": "⊽",
	"barwed": "⌅",
	"Barwed": "⌆",
	"barwedge": "⌅",
	"bbrk": "⎵",
	"bbrktbrk": "⎶",
	"bcong": "≌",
	"Bcy": "Б",
	"bcy": "б",
	"bdquo": "„",
	"becaus": "∵",
	"because": "∵",
	"Because": "∵",
	"bemptyv": "⦰",
	"bepsi": "϶",
	"bernou": "ℬ",
	"Bernoullis": "ℬ",
	"Beta": "Β",
	"beta": "β",
	"beth": "ℶ",
	"between": "≬",
	"Bfr": "𝔅",
	"bfr": "𝔟",
	"bigcap": "⋂",
	"bigcirc": "◯",
	"bigcup": "⋃",
	"bigodot": "⨀",
	"bigoplus": "⨁",
	"bigotimes": "⨂",
	"bigsqcup": "⨆",
	"bigstar": "★",
	"bigtriangledown": "▽",
	"bigtriangleup": "△",
	"biguplus": "⨄",
	"bigvee": "⋁",
	"bigwedge": "⋀",
	"bkarow": "⤍",
	"blacklozenge": "⧫",
	"blacksquare": "▪",
	"blacktriangle": "▴",
	"blacktriangledown": "▾",
	"blacktriangleleft": "◂",
	"blacktriangleright": "▸",
	"blank": "␣",
	"blk12": "▒",
	"blk14": "░",
	"blk34": "▓",
	"block": "█",
	"bne": "=⃥",
	"bnequiv": "≡⃥",
	"bNot": "⫭",
	"bnot": "⌐",
	"Bopf": "𝔹",
	"bopf": "𝕓",
	"bot": "⊥",
	"bottom": "⊥",
	"bowtie": "⋈",
	"boxbox": "⧉",
	"boxdl": "┐",
	"boxdL": "╕",
	"boxDl": "╖",
	"boxDL": "╗",
	"boxdr": "┌",
	"boxdR": "╒",
	"boxDr": "╓",
	"boxDR": "╔",
	"boxh": "─",
	"boxH": "═",
	"boxhd": "┬",
	"boxHd": "╤",
	"boxhD": "╥",
	"boxHD": "╦",
	"boxhu": "┴",
	"boxHu": "╧",
	"boxhU": "╨",
	"boxHU": "╩",
	"boxminus": "⊟",
	"boxplus": "⊞",
	"boxtimes": "⊠",
	"boxul": "┘",
	"boxuL": "╛",
	"boxUl": "╜",
	"boxUL": "╝",
	"boxur": "└",
	"boxuR": "╘",
	"boxUr": "╙",
	"boxUR": "╚",
	"boxv": "│",
	"boxV": "║",
	"boxvh": "┼",
	"boxvH": "╪",
	"boxVh": "╫",
	"boxVH": "╬",
	"boxvl": "┤",
	"boxvL": "╡",
	"boxVl": "╢",
	"boxVL": "╣",
	"boxvr": "├",
	"boxvR": "╞",
	"boxVr": "╟",
	"boxVR": "╠",
	"bprime": "‵",
	"breve": "˘",
	"Breve": "˘",
	"brvbar": "¦",
	"bscr": "𝒷",
	"Bscr": "ℬ",
	"bsemi": "⁏",
	"bsim": "∽",
	"bsime": "⋍",
	"bsolb": "⧅",
	"bsol": "\\",
	"bsolhsub": "⟈",
	"bull": "•",
	"bullet": "•",
	"bump": "≎",
	"bumpE": "⪮",
	"bumpe": "≏",
	"Bumpeq": "≎",
	"bumpeq": "≏",
	"Cacute": "Ć",
	"cacute": "ć",
	"capand": "⩄",
	"capbrcup": "⩉",
	"capcap": "⩋",
	"cap": "∩",
	"Cap": "⋒",
	"capcup": "⩇",
	"capdot": "⩀",
	"CapitalDifferentialD": "ⅅ",
	"caps": "∩︀",
	"caret": "⁁",
	"caron": "ˇ",
	"Cayleys": "ℭ",
	"ccaps": "⩍",
	"Ccaron": "Č",
	"ccaron": "č",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"Ccirc": "Ĉ",
	"ccirc": "ĉ",
	"Cconint": "∰",
	"ccups": "⩌",
	"ccupssm": "⩐",
	"Cdot": "Ċ",
	"cdot": "ċ",
	"cedil": "¸",
	"Cedilla": "¸",
	"cemptyv": "⦲",
	"cent": "¢",
	"centerdot": "·",
	"CenterDot": "·",
	"cfr": "𝔠",
	"Cfr": "ℭ",
	"CHcy": "Ч",
	"chcy": "ч",
	"check": "✓",
	"checkmark": "✓",
	"Chi": "Χ",
	"chi": "χ",
	"circ": "ˆ",
	"circeq": "≗",
	"circlearrowleft": "↺",
	"circlearrowright": "↻",
	"circledast": "⊛",
	"circledcirc": "⊚",
	"circleddash": "⊝",
	"CircleDot": "⊙",
	"circledR": "®",
	"circledS": "Ⓢ",
	"CircleMinus": "⊖",
	"CirclePlus": "⊕",
	"CircleTimes": "⊗",
	"cir": "○",
	"cirE": "⧃",
	"cire": "≗",
	"cirfnint": "⨐",
	"cirmid": "⫯",
	"cirscir": "⧂",
	"ClockwiseContourIntegral": "∲",
	"CloseCurlyDoubleQuote": "”",
	"CloseCurlyQuote": "’",
	"clubs": "♣",
	"clubsuit": "♣",
	"colon": ":",
	"Colon": "∷",
	"Colone": "⩴",
	"colone": "≔",
	"coloneq": "≔",
	"comma": ",",
	"commat": "@",
	"comp": "∁",
	"compfn": "∘",
	"complement": "∁",
	"complexes": "ℂ",
	"cong": "≅",
	"congdot": "⩭",
	"Congruent": "≡",
	"conint": "∮",
	"Conint": "∯",
	"ContourIntegral": "∮",
	"copf": "𝕔",
	"Copf": "ℂ",
	"coprod": "∐",
	"Coproduct": "∐",
	"copy": "©",
	"COPY": "©",
	"copysr": "℗",
	"CounterClockwiseContourIntegral": "∳",
	"crarr": "↵",
	"cross": "✗",
	"Cross": "⨯",
	"Cscr": "𝒞",
	"cscr": "𝒸",
	"csub": "⫏",
	"csube": "⫑",
	"csup": "⫐",
	"csupe": "⫒",
	"ctdot": "⋯",
	"cudarrl": "⤸",
	"cudarrr": "⤵",
	"cuepr": "⋞",
	"cuesc": "⋟",
	"cularr": "↶",
	"cularrp": "⤽",
	"cupbrcap": "⩈",
	"cupcap": "⩆",
	"CupCap": "≍",
	"cup": "∪",
	"Cup": "⋓",
	"cupcup": "⩊",
	"cupdot": "⊍",
	"cupor": "⩅",
	"cups": "∪︀",
	"curarr": "↷",
	"curarrm": "⤼",
	"curlyeqprec": "⋞",
	"curlyeqsucc": "⋟",
	"curlyvee": "⋎",
	"curlywedge": "⋏",
	"curren": "¤",
	"curvearrowleft": "↶",
	"curvearrowright": "↷",
	"cuvee": "⋎",
	"cuwed": "⋏",
	"cwconint": "∲",
	"cwint": "∱",
	"cylcty": "⌭",
	"dagger": "†",
	"Dagger": "‡",
	"daleth": "ℸ",
	"darr": "↓",
	"Darr": "↡",
	"dArr": "⇓",
	"dash": "‐",
	"Dashv": "⫤",
	"dashv": "⊣",
	"dbkarow": "⤏",
	"dblac": "˝",
	"Dcaron": "Ď",
	"dcaron": "ď",
	"Dcy": "Д",
	"dcy": "д",
	"ddagger": "‡",
	"ddarr": "⇊",
	"DD": "ⅅ",
	"dd": "ⅆ",
	"DDotrahd": "⤑",
	"ddotseq": "⩷",
	"deg": "°",
	"Del": "∇",
	"Delta": "Δ",
	"delta": "δ",
	"demptyv": "⦱",
	"dfisht": "⥿",
	"Dfr": "𝔇",
	"dfr": "𝔡",
	"dHar": "⥥",
	"dharl": "⇃",
	"dharr": "⇂",
	"DiacriticalAcute": "´",
	"DiacriticalDot": "˙",
	"DiacriticalDoubleAcute": "˝",
	"DiacriticalGrave": "`",
	"DiacriticalTilde": "˜",
	"diam": "⋄",
	"diamond": "⋄",
	"Diamond": "⋄",
	"diamondsuit": "♦",
	"diams": "♦",
	"die": "¨",
	"DifferentialD": "ⅆ",
	"digamma": "ϝ",
	"disin": "⋲",
	"div": "÷",
	"divide": "÷",
	"divideontimes": "⋇",
	"divonx": "⋇",
	"DJcy": "Ђ",
	"djcy": "ђ",
	"dlcorn": "⌞",
	"dlcrop": "⌍",
	"dollar": "$",
	"Dopf": "𝔻",
	"dopf": "𝕕",
	"Dot": "¨",
	"dot": "˙",
	"DotDot": "⃜",
	"doteq": "≐",
	"doteqdot": "≑",
	"DotEqual": "≐",
	"dotminus": "∸",
	"dotplus": "∔",
	"dotsquare": "⊡",
	"doublebarwedge": "⌆",
	"DoubleContourIntegral": "∯",
	"DoubleDot": "¨",
	"DoubleDownArrow": "⇓",
	"DoubleLeftArrow": "⇐",
	"DoubleLeftRightArrow": "⇔",
	"DoubleLeftTee": "⫤",
	"DoubleLongLeftArrow": "⟸",
	"DoubleLongLeftRightArrow": "⟺",
	"DoubleLongRightArrow": "⟹",
	"DoubleRightArrow": "⇒",
	"DoubleRightTee": "⊨",
	"DoubleUpArrow": "⇑",
	"DoubleUpDownArrow": "⇕",
	"DoubleVerticalBar": "∥",
	"DownArrowBar": "⤓",
	"downarrow": "↓",
	"DownArrow": "↓",
	"Downarrow": "⇓",
	"DownArrowUpArrow": "⇵",
	"DownBreve": "̑",
	"downdownarrows": "⇊",
	"downharpoonleft": "⇃",
	"downharpoonright": "⇂",
	"DownLeftRightVector": "⥐",
	"DownLeftTeeVector": "⥞",
	"DownLeftVectorBar": "⥖",
	"DownLeftVector": "↽",
	"DownRightTeeVector": "⥟",
	"DownRightVectorBar": "⥗",
	"DownRightVector": "⇁",
	"DownTeeArrow": "↧",
	"DownTee": "⊤",
	"drbkarow": "⤐",
	"drcorn": "⌟",
	"drcrop": "⌌",
	"Dscr": "𝒟",
	"dscr": "𝒹",
	"DScy": "Ѕ",
	"dscy": "ѕ",
	"dsol": "⧶",
	"Dstrok": "Đ",
	"dstrok": "đ",
	"dtdot": "⋱",
	"dtri": "▿",
	"dtrif": "▾",
	"duarr": "⇵",
	"duhar": "⥯",
	"dwangle": "⦦",
	"DZcy": "Џ",
	"dzcy": "џ",
	"dzigrarr": "⟿",
	"Eacute": "É",
	"eacute": "é",
	"easter": "⩮",
	"Ecaron": "Ě",
	"ecaron": "ě",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"ecir": "≖",
	"ecolon": "≕",
	"Ecy": "Э",
	"ecy": "э",
	"eDDot": "⩷",
	"Edot": "Ė",
	"edot": "ė",
	"eDot": "≑",
	"ee": "ⅇ",
	"efDot": "≒",
	"Efr": "𝔈",
	"efr": "𝔢",
	"eg": "⪚",
	"Egrave": "È",
	"egrave": "è",
	"egs": "⪖",
	"egsdot": "⪘",
	"el": "⪙",
	"Element": "∈",
	"elinters": "⏧",
	"ell": "ℓ",
	"els": "⪕",
	"elsdot": "⪗",
	"Emacr": "Ē",
	"emacr": "ē",
	"empty": "∅",
	"emptyset": "∅",
	"EmptySmallSquare": "◻",
	"emptyv": "∅",
	"EmptyVerySmallSquare": "▫",
	"emsp13": " ",
	"emsp14": " ",
	"emsp": " ",
	"ENG": "Ŋ",
	"eng": "ŋ",
	"ensp": " ",
	"Eogon": "Ę",
	"eogon": "ę",
	"Eopf": "𝔼",
	"eopf": "𝕖",
	"epar": "⋕",
	"eparsl": "⧣",
	"eplus": "⩱",
	"epsi": "ε",
	"Epsilon": "Ε",
	"epsilon": "ε",
	"epsiv": "ϵ",
	"eqcirc": "≖",
	"eqcolon": "≕",
	"eqsim": "≂",
	"eqslantgtr": "⪖",
	"eqslantless": "⪕",
	"Equal": "⩵",
	"equals": "=",
	"EqualTilde": "≂",
	"equest": "≟",
	"Equilibrium": "⇌",
	"equiv": "≡",
	"equivDD": "⩸",
	"eqvparsl": "⧥",
	"erarr": "⥱",
	"erDot": "≓",
	"escr": "ℯ",
	"Escr": "ℰ",
	"esdot": "≐",
	"Esim": "⩳",
	"esim": "≂",
	"Eta": "Η",
	"eta": "η",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"euro": "€",
	"excl": "!",
	"exist": "∃",
	"Exists": "∃",
	"expectation": "ℰ",
	"exponentiale": "ⅇ",
	"ExponentialE": "ⅇ",
	"fallingdotseq": "≒",
	"Fcy": "Ф",
	"fcy": "ф",
	"female": "♀",
	"ffilig": "ﬃ",
	"fflig": "ﬀ",
	"ffllig": "ﬄ",
	"Ffr": "𝔉",
	"ffr": "𝔣",
	"filig": "ﬁ",
	"FilledSmallSquare": "◼",
	"FilledVerySmallSquare": "▪",
	"fjlig": "fj",
	"flat": "♭",
	"fllig": "ﬂ",
	"fltns": "▱",
	"fnof": "ƒ",
	"Fopf": "𝔽",
	"fopf": "𝕗",
	"forall": "∀",
	"ForAll": "∀",
	"fork": "⋔",
	"forkv": "⫙",
	"Fouriertrf": "ℱ",
	"fpartint": "⨍",
	"frac12": "½",
	"frac13": "⅓",
	"frac14": "¼",
	"frac15": "⅕",
	"frac16": "⅙",
	"frac18": "⅛",
	"frac23": "⅔",
	"frac25": "⅖",
	"frac34": "¾",
	"frac35": "⅗",
	"frac38": "⅜",
	"frac45": "⅘",
	"frac56": "⅚",
	"frac58": "⅝",
	"frac78": "⅞",
	"frasl": "⁄",
	"frown": "⌢",
	"fscr": "𝒻",
	"Fscr": "ℱ",
	"gacute": "ǵ",
	"Gamma": "Γ",
	"gamma": "γ",
	"Gammad": "Ϝ",
	"gammad": "ϝ",
	"gap": "⪆",
	"Gbreve": "Ğ",
	"gbreve": "ğ",
	"Gcedil": "Ģ",
	"Gcirc": "Ĝ",
	"gcirc": "ĝ",
	"Gcy": "Г",
	"gcy": "г",
	"Gdot": "Ġ",
	"gdot": "ġ",
	"ge": "≥",
	"gE": "≧",
	"gEl": "⪌",
	"gel": "⋛",
	"geq": "≥",
	"geqq": "≧",
	"geqslant": "⩾",
	"gescc": "⪩",
	"ges": "⩾",
	"gesdot": "⪀",
	"gesdoto": "⪂",
	"gesdotol": "⪄",
	"gesl": "⋛︀",
	"gesles": "⪔",
	"Gfr": "𝔊",
	"gfr": "𝔤",
	"gg": "≫",
	"Gg": "⋙",
	"ggg": "⋙",
	"gimel": "ℷ",
	"GJcy": "Ѓ",
	"gjcy": "ѓ",
	"gla": "⪥",
	"gl": "≷",
	"glE": "⪒",
	"glj": "⪤",
	"gnap": "⪊",
	"gnapprox": "⪊",
	"gne": "⪈",
	"gnE": "≩",
	"gneq": "⪈",
	"gneqq": "≩",
	"gnsim": "⋧",
	"Gopf": "𝔾",
	"gopf": "𝕘",
	"grave": "`",
	"GreaterEqual": "≥",
	"GreaterEqualLess": "⋛",
	"GreaterFullEqual": "≧",
	"GreaterGreater": "⪢",
	"GreaterLess": "≷",
	"GreaterSlantEqual": "⩾",
	"GreaterTilde": "≳",
	"Gscr": "𝒢",
	"gscr": "ℊ",
	"gsim": "≳",
	"gsime": "⪎",
	"gsiml": "⪐",
	"gtcc": "⪧",
	"gtcir": "⩺",
	"gt": ">",
	"GT": ">",
	"Gt": "≫",
	"gtdot": "⋗",
	"gtlPar": "⦕",
	"gtquest": "⩼",
	"gtrapprox": "⪆",
	"gtrarr": "⥸",
	"gtrdot": "⋗",
	"gtreqless": "⋛",
	"gtreqqless": "⪌",
	"gtrless": "≷",
	"gtrsim": "≳",
	"gvertneqq": "≩︀",
	"gvnE": "≩︀",
	"Hacek": "ˇ",
	"hairsp": " ",
	"half": "½",
	"hamilt": "ℋ",
	"HARDcy": "Ъ",
	"hardcy": "ъ",
	"harrcir": "⥈",
	"harr": "↔",
	"hArr": "⇔",
	"harrw": "↭",
	"Hat": "^",
	"hbar": "ℏ",
	"Hcirc": "Ĥ",
	"hcirc": "ĥ",
	"hearts": "♥",
	"heartsuit": "♥",
	"hellip": "…",
	"hercon": "⊹",
	"hfr": "𝔥",
	"Hfr": "ℌ",
	"HilbertSpace": "ℋ",
	"hksearow": "⤥",
	"hkswarow": "⤦",
	"hoarr": "⇿",
	"homtht": "∻",
	"hookleftarrow": "↩",
	"hookrightarrow": "↪",
	"hopf": "𝕙",
	"Hopf": "ℍ",
	"horbar": "―",
	"HorizontalLine": "─",
	"hscr": "𝒽",
	"Hscr": "ℋ",
	"hslash": "ℏ",
	"Hstrok": "Ħ",
	"hstrok": "ħ",
	"HumpDownHump": "≎",
	"HumpEqual": "≏",
	"hybull": "⁃",
	"hyphen": "‐",
	"Iacute": "Í",
	"iacute": "í",
	"ic": "⁣",
	"Icirc": "Î",
	"icirc": "î",
	"Icy": "И",
	"icy": "и",
	"Idot": "İ",
	"IEcy": "Е",
	"iecy": "е",
	"iexcl": "¡",
	"iff": "⇔",
	"ifr": "𝔦",
	"Ifr": "ℑ",
	"Igrave": "Ì",
	"igrave": "ì",
	"ii": "ⅈ",
	"iiiint": "⨌",
	"iiint": "∭",
	"iinfin": "⧜",
	"iiota": "℩",
	"IJlig": "Ĳ",
	"ijlig": "ĳ",
	"Imacr": "Ī",
	"imacr": "ī",
	"image": "ℑ",
	"ImaginaryI": "ⅈ",
	"imagline": "ℐ",
	"imagpart": "ℑ",
	"imath": "ı",
	"Im": "ℑ",
	"imof": "⊷",
	"imped": "Ƶ",
	"Implies": "⇒",
	"incare": "℅",
	"in": "∈",
	"infin": "∞",
	"infintie": "⧝",
	"inodot": "ı",
	"intcal": "⊺",
	"int": "∫",
	"Int": "∬",
	"integers": "ℤ",
	"Integral": "∫",
	"intercal": "⊺",
	"Intersection": "⋂",
	"intlarhk": "⨗",
	"intprod": "⨼",
	"InvisibleComma": "⁣",
	"InvisibleTimes": "⁢",
	"IOcy": "Ё",
	"iocy": "ё",
	"Iogon": "Į",
	"iogon": "į",
	"Iopf": "𝕀",
	"iopf": "𝕚",
	"Iota": "Ι",
	"iota": "ι",
	"iprod": "⨼",
	"iquest": "¿",
	"iscr": "𝒾",
	"Iscr": "ℐ",
	"isin": "∈",
	"isindot": "⋵",
	"isinE": "⋹",
	"isins": "⋴",
	"isinsv": "⋳",
	"isinv": "∈",
	"it": "⁢",
	"Itilde": "Ĩ",
	"itilde": "ĩ",
	"Iukcy": "І",
	"iukcy": "і",
	"Iuml": "Ï",
	"iuml": "ï",
	"Jcirc": "Ĵ",
	"jcirc": "ĵ",
	"Jcy": "Й",
	"jcy": "й",
	"Jfr": "𝔍",
	"jfr": "𝔧",
	"jmath": "ȷ",
	"Jopf": "𝕁",
	"jopf": "𝕛",
	"Jscr": "𝒥",
	"jscr": "𝒿",
	"Jsercy": "Ј",
	"jsercy": "ј",
	"Jukcy": "Є",
	"jukcy": "є",
	"Kappa": "Κ",
	"kappa": "κ",
	"kappav": "ϰ",
	"Kcedil": "Ķ",
	"kcedil": "ķ",
	"Kcy": "К",
	"kcy": "к",
	"Kfr": "𝔎",
	"kfr": "𝔨",
	"kgreen": "ĸ",
	"KHcy": "Х",
	"khcy": "х",
	"KJcy": "Ќ",
	"kjcy": "ќ",
	"Kopf": "𝕂",
	"kopf": "𝕜",
	"Kscr": "𝒦",
	"kscr": "𝓀",
	"lAarr": "⇚",
	"Lacute": "Ĺ",
	"lacute": "ĺ",
	"laemptyv": "⦴",
	"lagran": "ℒ",
	"Lambda": "Λ",
	"lambda": "λ",
	"lang": "⟨",
	"Lang": "⟪",
	"langd": "⦑",
	"langle": "⟨",
	"lap": "⪅",
	"Laplacetrf": "ℒ",
	"laquo": "«",
	"larrb": "⇤",
	"larrbfs": "⤟",
	"larr": "←",
	"Larr": "↞",
	"lArr": "⇐",
	"larrfs": "⤝",
	"larrhk": "↩",
	"larrlp": "↫",
	"larrpl": "⤹",
	"larrsim": "⥳",
	"larrtl": "↢",
	"latail": "⤙",
	"lAtail": "⤛",
	"lat": "⪫",
	"late": "⪭",
	"lates": "⪭︀",
	"lbarr": "⤌",
	"lBarr": "⤎",
	"lbbrk": "❲",
	"lbrace": "{",
	"lbrack": "[",
	"lbrke": "⦋",
	"lbrksld": "⦏",
	"lbrkslu": "⦍",
	"Lcaron": "Ľ",
	"lcaron": "ľ",
	"Lcedil": "Ļ",
	"lcedil": "ļ",
	"lceil": "⌈",
	"lcub": "{",
	"Lcy": "Л",
	"lcy": "л",
	"ldca": "⤶",
	"ldquo": "“",
	"ldquor": "„",
	"ldrdhar": "⥧",
	"ldrushar": "⥋",
	"ldsh": "↲",
	"le": "≤",
	"lE": "≦",
	"LeftAngleBracket": "⟨",
	"LeftArrowBar": "⇤",
	"leftarrow": "←",
	"LeftArrow": "←",
	"Leftarrow": "⇐",
	"LeftArrowRightArrow": "⇆",
	"leftarrowtail": "↢",
	"LeftCeiling": "⌈",
	"LeftDoubleBracket": "⟦",
	"LeftDownTeeVector": "⥡",
	"LeftDownVectorBar": "⥙",
	"LeftDownVector": "⇃",
	"LeftFloor": "⌊",
	"leftharpoondown": "↽",
	"leftharpoonup": "↼",
	"leftleftarrows": "⇇",
	"leftrightarrow": "↔",
	"LeftRightArrow": "↔",
	"Leftrightarrow": "⇔",
	"leftrightarrows": "⇆",
	"leftrightharpoons": "⇋",
	"leftrightsquigarrow": "↭",
	"LeftRightVector": "⥎",
	"LeftTeeArrow": "↤",
	"LeftTee": "⊣",
	"LeftTeeVector": "⥚",
	"leftthreetimes": "⋋",
	"LeftTriangleBar": "⧏",
	"LeftTriangle": "⊲",
	"LeftTriangleEqual": "⊴",
	"LeftUpDownVector": "⥑",
	"LeftUpTeeVector": "⥠",
	"LeftUpVectorBar": "⥘",
	"LeftUpVector": "↿",
	"LeftVectorBar": "⥒",
	"LeftVector": "↼",
	"lEg": "⪋",
	"leg": "⋚",
	"leq": "≤",
	"leqq": "≦",
	"leqslant": "⩽",
	"lescc": "⪨",
	"les": "⩽",
	"lesdot": "⩿",
	"lesdoto": "⪁",
	"lesdotor": "⪃",
	"lesg": "⋚︀",
	"lesges": "⪓",
	"lessapprox": "⪅",
	"lessdot": "⋖",
	"lesseqgtr": "⋚",
	"lesseqqgtr": "⪋",
	"LessEqualGreater": "⋚",
	"LessFullEqual": "≦",
	"LessGreater": "≶",
	"lessgtr": "≶",
	"LessLess": "⪡",
	"lesssim": "≲",
	"LessSlantEqual": "⩽",
	"LessTilde": "≲",
	"lfisht": "⥼",
	"lfloor": "⌊",
	"Lfr": "𝔏",
	"lfr": "𝔩",
	"lg": "≶",
	"lgE": "⪑",
	"lHar": "⥢",
	"lhard": "↽",
	"lharu": "↼",
	"lharul": "⥪",
	"lhblk": "▄",
	"LJcy": "Љ",
	"ljcy": "љ",
	"llarr": "⇇",
	"ll": "≪",
	"Ll": "⋘",
	"llcorner": "⌞",
	"Lleftarrow": "⇚",
	"llhard": "⥫",
	"lltri": "◺",
	"Lmidot": "Ŀ",
	"lmidot": "ŀ",
	"lmoustache": "⎰",
	"lmoust": "⎰",
	"lnap": "⪉",
	"lnapprox": "⪉",
	"lne": "⪇",
	"lnE": "≨",
	"lneq": "⪇",
	"lneqq": "≨",
	"lnsim": "⋦",
	"loang": "⟬",
	"loarr": "⇽",
	"lobrk": "⟦",
	"longleftarrow": "⟵",
	"LongLeftArrow": "⟵",
	"Longleftarrow": "⟸",
	"longleftrightarrow": "⟷",
	"LongLeftRightArrow": "⟷",
	"Longleftrightarrow": "⟺",
	"longmapsto": "⟼",
	"longrightarrow": "⟶",
	"LongRightArrow": "⟶",
	"Longrightarrow": "⟹",
	"looparrowleft": "↫",
	"looparrowright": "↬",
	"lopar": "⦅",
	"Lopf": "𝕃",
	"lopf": "𝕝",
	"loplus": "⨭",
	"lotimes": "⨴",
	"lowast": "∗",
	"lowbar": "_",
	"LowerLeftArrow": "↙",
	"LowerRightArrow": "↘",
	"loz": "◊",
	"lozenge": "◊",
	"lozf": "⧫",
	"lpar": "(",
	"lparlt": "⦓",
	"lrarr": "⇆",
	"lrcorner": "⌟",
	"lrhar": "⇋",
	"lrhard": "⥭",
	"lrm": "‎",
	"lrtri": "⊿",
	"lsaquo": "‹",
	"lscr": "𝓁",
	"Lscr": "ℒ",
	"lsh": "↰",
	"Lsh": "↰",
	"lsim": "≲",
	"lsime": "⪍",
	"lsimg": "⪏",
	"lsqb": "[",
	"lsquo": "‘",
	"lsquor": "‚",
	"Lstrok": "Ł",
	"lstrok": "ł",
	"ltcc": "⪦",
	"ltcir": "⩹",
	"lt": "<",
	"LT": "<",
	"Lt": "≪",
	"ltdot": "⋖",
	"lthree": "⋋",
	"ltimes": "⋉",
	"ltlarr": "⥶",
	"ltquest": "⩻",
	"ltri": "◃",
	"ltrie": "⊴",
	"ltrif": "◂",
	"ltrPar": "⦖",
	"lurdshar": "⥊",
	"luruhar": "⥦",
	"lvertneqq": "≨︀",
	"lvnE": "≨︀",
	"macr": "¯",
	"male": "♂",
	"malt": "✠",
	"maltese": "✠",
	"Map": "⤅",
	"map": "↦",
	"mapsto": "↦",
	"mapstodown": "↧",
	"mapstoleft": "↤",
	"mapstoup": "↥",
	"marker": "▮",
	"mcomma": "⨩",
	"Mcy": "М",
	"mcy": "м",
	"mdash": "—",
	"mDDot": "∺",
	"measuredangle": "∡",
	"MediumSpace": " ",
	"Mellintrf": "ℳ",
	"Mfr": "𝔐",
	"mfr": "𝔪",
	"mho": "℧",
	"micro": "µ",
	"midast": "*",
	"midcir": "⫰",
	"mid": "∣",
	"middot": "·",
	"minusb": "⊟",
	"minus": "−",
	"minusd": "∸",
	"minusdu": "⨪",
	"MinusPlus": "∓",
	"mlcp": "⫛",
	"mldr": "…",
	"mnplus": "∓",
	"models": "⊧",
	"Mopf": "𝕄",
	"mopf": "𝕞",
	"mp": "∓",
	"mscr": "𝓂",
	"Mscr": "ℳ",
	"mstpos": "∾",
	"Mu": "Μ",
	"mu": "μ",
	"multimap": "⊸",
	"mumap": "⊸",
	"nabla": "∇",
	"Nacute": "Ń",
	"nacute": "ń",
	"nang": "∠⃒",
	"nap": "≉",
	"napE": "⩰̸",
	"napid": "≋̸",
	"napos": "ŉ",
	"napprox": "≉",
	"natural": "♮",
	"naturals": "ℕ",
	"natur": "♮",
	"nbsp": " ",
	"nbump": "≎̸",
	"nbumpe": "≏̸",
	"ncap": "⩃",
	"Ncaron": "Ň",
	"ncaron": "ň",
	"Ncedil": "Ņ",
	"ncedil": "ņ",
	"ncong": "≇",
	"ncongdot": "⩭̸",
	"ncup": "⩂",
	"Ncy": "Н",
	"ncy": "н",
	"ndash": "–",
	"nearhk": "⤤",
	"nearr": "↗",
	"neArr": "⇗",
	"nearrow": "↗",
	"ne": "≠",
	"nedot": "≐̸",
	"NegativeMediumSpace": "​",
	"NegativeThickSpace": "​",
	"NegativeThinSpace": "​",
	"NegativeVeryThinSpace": "​",
	"nequiv": "≢",
	"nesear": "⤨",
	"nesim": "≂̸",
	"NestedGreaterGreater": "≫",
	"NestedLessLess": "≪",
	"NewLine": "\n",
	"nexist": "∄",
	"nexists": "∄",
	"Nfr": "𝔑",
	"nfr": "𝔫",
	"ngE": "≧̸",
	"nge": "≱",
	"ngeq": "≱",
	"ngeqq": "≧̸",
	"ngeqslant": "⩾̸",
	"nges": "⩾̸",
	"nGg": "⋙̸",
	"ngsim": "≵",
	"nGt": "≫⃒",
	"ngt": "≯",
	"ngtr": "≯",
	"nGtv": "≫̸",
	"nharr": "↮",
	"nhArr": "⇎",
	"nhpar": "⫲",
	"ni": "∋",
	"nis": "⋼",
	"nisd": "⋺",
	"niv": "∋",
	"NJcy": "Њ",
	"njcy": "њ",
	"nlarr": "↚",
	"nlArr": "⇍",
	"nldr": "‥",
	"nlE": "≦̸",
	"nle": "≰",
	"nleftarrow": "↚",
	"nLeftarrow": "⇍",
	"nleftrightarrow": "↮",
	"nLeftrightarrow": "⇎",
	"nleq": "≰",
	"nleqq": "≦̸",
	"nleqslant": "⩽̸",
	"nles": "⩽̸",
	"nless": "≮",
	"nLl": "⋘̸",
	"nlsim": "≴",
	"nLt": "≪⃒",
	"nlt": "≮",
	"nltri": "⋪",
	"nltrie": "⋬",
	"nLtv": "≪̸",
	"nmid": "∤",
	"NoBreak": "⁠",
	"NonBreakingSpace": " ",
	"nopf": "𝕟",
	"Nopf": "ℕ",
	"Not": "⫬",
	"not": "¬",
	"NotCongruent": "≢",
	"NotCupCap": "≭",
	"NotDoubleVerticalBar": "∦",
	"NotElement": "∉",
	"NotEqual": "≠",
	"NotEqualTilde": "≂̸",
	"NotExists": "∄",
	"NotGreater": "≯",
	"NotGreaterEqual": "≱",
	"NotGreaterFullEqual": "≧̸",
	"NotGreaterGreater": "≫̸",
	"NotGreaterLess": "≹",
	"NotGreaterSlantEqual": "⩾̸",
	"NotGreaterTilde": "≵",
	"NotHumpDownHump": "≎̸",
	"NotHumpEqual": "≏̸",
	"notin": "∉",
	"notindot": "⋵̸",
	"notinE": "⋹̸",
	"notinva": "∉",
	"notinvb": "⋷",
	"notinvc": "⋶",
	"NotLeftTriangleBar": "⧏̸",
	"NotLeftTriangle": "⋪",
	"NotLeftTriangleEqual": "⋬",
	"NotLess": "≮",
	"NotLessEqual": "≰",
	"NotLessGreater": "≸",
	"NotLessLess": "≪̸",
	"NotLessSlantEqual": "⩽̸",
	"NotLessTilde": "≴",
	"NotNestedGreaterGreater": "⪢̸",
	"NotNestedLessLess": "⪡̸",
	"notni": "∌",
	"notniva": "∌",
	"notnivb": "⋾",
	"notnivc": "⋽",
	"NotPrecedes": "⊀",
	"NotPrecedesEqual": "⪯̸",
	"NotPrecedesSlantEqual": "⋠",
	"NotReverseElement": "∌",
	"NotRightTriangleBar": "⧐̸",
	"NotRightTriangle": "⋫",
	"NotRightTriangleEqual": "⋭",
	"NotSquareSubset": "⊏̸",
	"NotSquareSubsetEqual": "⋢",
	"NotSquareSuperset": "⊐̸",
	"NotSquareSupersetEqual": "⋣",
	"NotSubset": "⊂⃒",
	"NotSubsetEqual": "⊈",
	"NotSucceeds": "⊁",
	"NotSucceedsEqual": "⪰̸",
	"NotSucceedsSlantEqual": "⋡",
	"NotSucceedsTilde": "≿̸",
	"NotSuperset": "⊃⃒",
	"NotSupersetEqual": "⊉",
	"NotTilde": "≁",
	"NotTildeEqual": "≄",
	"NotTildeFullEqual": "≇",
	"NotTildeTilde": "≉",
	"NotVerticalBar": "∤",
	"nparallel": "∦",
	"npar": "∦",
	"nparsl": "⫽⃥",
	"npart": "∂̸",
	"npolint": "⨔",
	"npr": "⊀",
	"nprcue": "⋠",
	"nprec": "⊀",
	"npreceq": "⪯̸",
	"npre": "⪯̸",
	"nrarrc": "⤳̸",
	"nrarr": "↛",
	"nrArr": "⇏",
	"nrarrw": "↝̸",
	"nrightarrow": "↛",
	"nRightarrow": "⇏",
	"nrtri": "⋫",
	"nrtrie": "⋭",
	"nsc": "⊁",
	"nsccue": "⋡",
	"nsce": "⪰̸",
	"Nscr": "𝒩",
	"nscr": "𝓃",
	"nshortmid": "∤",
	"nshortparallel": "∦",
	"nsim": "≁",
	"nsime": "≄",
	"nsimeq": "≄",
	"nsmid": "∤",
	"nspar": "∦",
	"nsqsube": "⋢",
	"nsqsupe": "⋣",
	"nsub": "⊄",
	"nsubE": "⫅̸",
	"nsube": "⊈",
	"nsubset": "⊂⃒",
	"nsubseteq": "⊈",
	"nsubseteqq": "⫅̸",
	"nsucc": "⊁",
	"nsucceq": "⪰̸",
	"nsup": "⊅",
	"nsupE": "⫆̸",
	"nsupe": "⊉",
	"nsupset": "⊃⃒",
	"nsupseteq": "⊉",
	"nsupseteqq": "⫆̸",
	"ntgl": "≹",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"ntlg": "≸",
	"ntriangleleft": "⋪",
	"ntrianglelefteq": "⋬",
	"ntriangleright": "⋫",
	"ntrianglerighteq": "⋭",
	"Nu": "Ν",
	"nu": "ν",
	"num": "#",
	"numero": "№",
	"numsp": " ",
	"nvap": "≍⃒",
	"nvdash": "⊬",
	"nvDash": "⊭",
	"nVdash": "⊮",
	"nVDash": "⊯",
	"nvge": "≥⃒",
	"nvgt": ">⃒",
	"nvHarr": "⤄",
	"nvinfin": "⧞",
	"nvlArr": "⤂",
	"nvle": "≤⃒",
	"nvlt": "<⃒",
	"nvltrie": "⊴⃒",
	"nvrArr": "⤃",
	"nvrtrie": "⊵⃒",
	"nvsim": "∼⃒",
	"nwarhk": "⤣",
	"nwarr": "↖",
	"nwArr": "⇖",
	"nwarrow": "↖",
	"nwnear": "⤧",
	"Oacute": "Ó",
	"oacute": "ó",
	"oast": "⊛",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"ocir": "⊚",
	"Ocy": "О",
	"ocy": "о",
	"odash": "⊝",
	"Odblac": "Ő",
	"odblac": "ő",
	"odiv": "⨸",
	"odot": "⊙",
	"odsold": "⦼",
	"OElig": "Œ",
	"oelig": "œ",
	"ofcir": "⦿",
	"Ofr": "𝔒",
	"ofr": "𝔬",
	"ogon": "˛",
	"Ograve": "Ò",
	"ograve": "ò",
	"ogt": "⧁",
	"ohbar": "⦵",
	"ohm": "Ω",
	"oint": "∮",
	"olarr": "↺",
	"olcir": "⦾",
	"olcross": "⦻",
	"oline": "‾",
	"olt": "⧀",
	"Omacr": "Ō",
	"omacr": "ō",
	"Omega": "Ω",
	"omega": "ω",
	"Omicron": "Ο",
	"omicron": "ο",
	"omid": "⦶",
	"ominus": "⊖",
	"Oopf": "𝕆",
	"oopf": "𝕠",
	"opar": "⦷",
	"OpenCurlyDoubleQuote": "“",
	"OpenCurlyQuote": "‘",
	"operp": "⦹",
	"oplus": "⊕",
	"orarr": "↻",
	"Or": "⩔",
	"or": "∨",
	"ord": "⩝",
	"order": "ℴ",
	"orderof": "ℴ",
	"ordf": "ª",
	"ordm": "º",
	"origof": "⊶",
	"oror": "⩖",
	"orslope": "⩗",
	"orv": "⩛",
	"oS": "Ⓢ",
	"Oscr": "𝒪",
	"oscr": "ℴ",
	"Oslash": "Ø",
	"oslash": "ø",
	"osol": "⊘",
	"Otilde": "Õ",
	"otilde": "õ",
	"otimesas": "⨶",
	"Otimes": "⨷",
	"otimes": "⊗",
	"Ouml": "Ö",
	"ouml": "ö",
	"ovbar": "⌽",
	"OverBar": "‾",
	"OverBrace": "⏞",
	"OverBracket": "⎴",
	"OverParenthesis": "⏜",
	"para": "¶",
	"parallel": "∥",
	"par": "∥",
	"parsim": "⫳",
	"parsl": "⫽",
	"part": "∂",
	"PartialD": "∂",
	"Pcy": "П",
	"pcy": "п",
	"percnt": "%",
	"period": ".",
	"permil": "‰",
	"perp": "⊥",
	"pertenk": "‱",
	"Pfr": "𝔓",
	"pfr": "𝔭",
	"Phi": "Φ",
	"phi": "φ",
	"phiv": "ϕ",
	"phmmat": "ℳ",
	"phone": "☎",
	"Pi": "Π",
	"pi": "π",
	"pitchfork": "⋔",
	"piv": "ϖ",
	"planck": "ℏ",
	"planckh": "ℎ",
	"plankv": "ℏ",
	"plusacir": "⨣",
	"plusb": "⊞",
	"pluscir": "⨢",
	"plus": "+",
	"plusdo": "∔",
	"plusdu": "⨥",
	"pluse": "⩲",
	"PlusMinus": "±",
	"plusmn": "±",
	"plussim": "⨦",
	"plustwo": "⨧",
	"pm": "±",
	"Poincareplane": "ℌ",
	"pointint": "⨕",
	"popf": "𝕡",
	"Popf": "ℙ",
	"pound": "£",
	"prap": "⪷",
	"Pr": "⪻",
	"pr": "≺",
	"prcue": "≼",
	"precapprox": "⪷",
	"prec": "≺",
	"preccurlyeq": "≼",
	"Precedes": "≺",
	"PrecedesEqual": "⪯",
	"PrecedesSlantEqual": "≼",
	"PrecedesTilde": "≾",
	"preceq": "⪯",
	"precnapprox": "⪹",
	"precneqq": "⪵",
	"precnsim": "⋨",
	"pre": "⪯",
	"prE": "⪳",
	"precsim": "≾",
	"prime": "′",
	"Prime": "″",
	"primes": "ℙ",
	"prnap": "⪹",
	"prnE": "⪵",
	"prnsim": "⋨",
	"prod": "∏",
	"Product": "∏",
	"profalar": "⌮",
	"profline": "⌒",
	"profsurf": "⌓",
	"prop": "∝",
	"Proportional": "∝",
	"Proportion": "∷",
	"propto": "∝",
	"prsim": "≾",
	"prurel": "⊰",
	"Pscr": "𝒫",
	"pscr": "𝓅",
	"Psi": "Ψ",
	"psi": "ψ",
	"puncsp": " ",
	"Qfr": "𝔔",
	"qfr": "𝔮",
	"qint": "⨌",
	"qopf": "𝕢",
	"Qopf": "ℚ",
	"qprime": "⁗",
	"Qscr": "𝒬",
	"qscr": "𝓆",
	"quaternions": "ℍ",
	"quatint": "⨖",
	"quest": "?",
	"questeq": "≟",
	"quot": "\"",
	"QUOT": "\"",
	"rAarr": "⇛",
	"race": "∽̱",
	"Racute": "Ŕ",
	"racute": "ŕ",
	"radic": "√",
	"raemptyv": "⦳",
	"rang": "⟩",
	"Rang": "⟫",
	"rangd": "⦒",
	"range": "⦥",
	"rangle": "⟩",
	"raquo": "»",
	"rarrap": "⥵",
	"rarrb": "⇥",
	"rarrbfs": "⤠",
	"rarrc": "⤳",
	"rarr": "→",
	"Rarr": "↠",
	"rArr": "⇒",
	"rarrfs": "⤞",
	"rarrhk": "↪",
	"rarrlp": "↬",
	"rarrpl": "⥅",
	"rarrsim": "⥴",
	"Rarrtl": "⤖",
	"rarrtl": "↣",
	"rarrw": "↝",
	"ratail": "⤚",
	"rAtail": "⤜",
	"ratio": "∶",
	"rationals": "ℚ",
	"rbarr": "⤍",
	"rBarr": "⤏",
	"RBarr": "⤐",
	"rbbrk": "❳",
	"rbrace": "}",
	"rbrack": "]",
	"rbrke": "⦌",
	"rbrksld": "⦎",
	"rbrkslu": "⦐",
	"Rcaron": "Ř",
	"rcaron": "ř",
	"Rcedil": "Ŗ",
	"rcedil": "ŗ",
	"rceil": "⌉",
	"rcub": "}",
	"Rcy": "Р",
	"rcy": "р",
	"rdca": "⤷",
	"rdldhar": "⥩",
	"rdquo": "”",
	"rdquor": "”",
	"rdsh": "↳",
	"real": "ℜ",
	"realine": "ℛ",
	"realpart": "ℜ",
	"reals": "ℝ",
	"Re": "ℜ",
	"rect": "▭",
	"reg": "®",
	"REG": "®",
	"ReverseElement": "∋",
	"ReverseEquilibrium": "⇋",
	"ReverseUpEquilibrium": "⥯",
	"rfisht": "⥽",
	"rfloor": "⌋",
	"rfr": "𝔯",
	"Rfr": "ℜ",
	"rHar": "⥤",
	"rhard": "⇁",
	"rharu": "⇀",
	"rharul": "⥬",
	"Rho": "Ρ",
	"rho": "ρ",
	"rhov": "ϱ",
	"RightAngleBracket": "⟩",
	"RightArrowBar": "⇥",
	"rightarrow": "→",
	"RightArrow": "→",
	"Rightarrow": "⇒",
	"RightArrowLeftArrow": "⇄",
	"rightarrowtail": "↣",
	"RightCeiling": "⌉",
	"RightDoubleBracket": "⟧",
	"RightDownTeeVector": "⥝",
	"RightDownVectorBar": "⥕",
	"RightDownVector": "⇂",
	"RightFloor": "⌋",
	"rightharpoondown": "⇁",
	"rightharpoonup": "⇀",
	"rightleftarrows": "⇄",
	"rightleftharpoons": "⇌",
	"rightrightarrows": "⇉",
	"rightsquigarrow": "↝",
	"RightTeeArrow": "↦",
	"RightTee": "⊢",
	"RightTeeVector": "⥛",
	"rightthreetimes": "⋌",
	"RightTriangleBar": "⧐",
	"RightTriangle": "⊳",
	"RightTriangleEqual": "⊵",
	"RightUpDownVector": "⥏",
	"RightUpTeeVector": "⥜",
	"RightUpVectorBar": "⥔",
	"RightUpVector": "↾",
	"RightVectorBar": "⥓",
	"RightVector": "⇀",
	"ring": "˚",
	"risingdotseq": "≓",
	"rlarr": "⇄",
	"rlhar": "⇌",
	"rlm": "‏",
	"rmoustache": "⎱",
	"rmoust": "⎱",
	"rnmid": "⫮",
	"roang": "⟭",
	"roarr": "⇾",
	"robrk": "⟧",
	"ropar": "⦆",
	"ropf": "𝕣",
	"Ropf": "ℝ",
	"roplus": "⨮",
	"rotimes": "⨵",
	"RoundImplies": "⥰",
	"rpar": ")",
	"rpargt": "⦔",
	"rppolint": "⨒",
	"rrarr": "⇉",
	"Rrightarrow": "⇛",
	"rsaquo": "›",
	"rscr": "𝓇",
	"Rscr": "ℛ",
	"rsh": "↱",
	"Rsh": "↱",
	"rsqb": "]",
	"rsquo": "’",
	"rsquor": "’",
	"rthree": "⋌",
	"rtimes": "⋊",
	"rtri": "▹",
	"rtrie": "⊵",
	"rtrif": "▸",
	"rtriltri": "⧎",
	"RuleDelayed": "⧴",
	"ruluhar": "⥨",
	"rx": "℞",
	"Sacute": "Ś",
	"sacute": "ś",
	"sbquo": "‚",
	"scap": "⪸",
	"Scaron": "Š",
	"scaron": "š",
	"Sc": "⪼",
	"sc": "≻",
	"sccue": "≽",
	"sce": "⪰",
	"scE": "⪴",
	"Scedil": "Ş",
	"scedil": "ş",
	"Scirc": "Ŝ",
	"scirc": "ŝ",
	"scnap": "⪺",
	"scnE": "⪶",
	"scnsim": "⋩",
	"scpolint": "⨓",
	"scsim": "≿",
	"Scy": "С",
	"scy": "с",
	"sdotb": "⊡",
	"sdot": "⋅",
	"sdote": "⩦",
	"searhk": "⤥",
	"searr": "↘",
	"seArr": "⇘",
	"searrow": "↘",
	"sect": "§",
	"semi": ";",
	"seswar": "⤩",
	"setminus": "∖",
	"setmn": "∖",
	"sext": "✶",
	"Sfr": "𝔖",
	"sfr": "𝔰",
	"sfrown": "⌢",
	"sharp": "♯",
	"SHCHcy": "Щ",
	"shchcy": "щ",
	"SHcy": "Ш",
	"shcy": "ш",
	"ShortDownArrow": "↓",
	"ShortLeftArrow": "←",
	"shortmid": "∣",
	"shortparallel": "∥",
	"ShortRightArrow": "→",
	"ShortUpArrow": "↑",
	"shy": "­",
	"Sigma": "Σ",
	"sigma": "σ",
	"sigmaf": "ς",
	"sigmav": "ς",
	"sim": "∼",
	"simdot": "⩪",
	"sime": "≃",
	"simeq": "≃",
	"simg": "⪞",
	"simgE": "⪠",
	"siml": "⪝",
	"simlE": "⪟",
	"simne": "≆",
	"simplus": "⨤",
	"simrarr": "⥲",
	"slarr": "←",
	"SmallCircle": "∘",
	"smallsetminus": "∖",
	"smashp": "⨳",
	"smeparsl": "⧤",
	"smid": "∣",
	"smile": "⌣",
	"smt": "⪪",
	"smte": "⪬",
	"smtes": "⪬︀",
	"SOFTcy": "Ь",
	"softcy": "ь",
	"solbar": "⌿",
	"solb": "⧄",
	"sol": "/",
	"Sopf": "𝕊",
	"sopf": "𝕤",
	"spades": "♠",
	"spadesuit": "♠",
	"spar": "∥",
	"sqcap": "⊓",
	"sqcaps": "⊓︀",
	"sqcup": "⊔",
	"sqcups": "⊔︀",
	"Sqrt": "√",
	"sqsub": "⊏",
	"sqsube": "⊑",
	"sqsubset": "⊏",
	"sqsubseteq": "⊑",
	"sqsup": "⊐",
	"sqsupe": "⊒",
	"sqsupset": "⊐",
	"sqsupseteq": "⊒",
	"square": "□",
	"Square": "□",
	"SquareIntersection": "⊓",
	"SquareSubset": "⊏",
	"SquareSubsetEqual": "⊑",
	"SquareSuperset": "⊐",
	"SquareSupersetEqual": "⊒",
	"SquareUnion": "⊔",
	"squarf": "▪",
	"squ": "□",
	"squf": "▪",
	"srarr": "→",
	"Sscr": "𝒮",
	"sscr": "𝓈",
	"ssetmn": "∖",
	"ssmile": "⌣",
	"sstarf": "⋆",
	"Star": "⋆",
	"star": "☆",
	"starf": "★",
	"straightepsilon": "ϵ",
	"straightphi": "ϕ",
	"strns": "¯",
	"sub": "⊂",
	"Sub": "⋐",
	"subdot": "⪽",
	"subE": "⫅",
	"sube": "⊆",
	"subedot": "⫃",
	"submult": "⫁",
	"subnE": "⫋",
	"subne": "⊊",
	"subplus": "⪿",
	"subrarr": "⥹",
	"subset": "⊂",
	"Subset": "⋐",
	"subseteq": "⊆",
	"subseteqq": "⫅",
	"SubsetEqual": "⊆",
	"subsetneq": "⊊",
	"subsetneqq": "⫋",
	"subsim": "⫇",
	"subsub": "⫕",
	"subsup": "⫓",
	"succapprox": "⪸",
	"succ": "≻",
	"succcurlyeq": "≽",
	"Succeeds": "≻",
	"SucceedsEqual": "⪰",
	"SucceedsSlantEqual": "≽",
	"SucceedsTilde": "≿",
	"succeq": "⪰",
	"succnapprox": "⪺",
	"succneqq": "⪶",
	"succnsim": "⋩",
	"succsim": "≿",
	"SuchThat": "∋",
	"sum": "∑",
	"Sum": "∑",
	"sung": "♪",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"sup": "⊃",
	"Sup": "⋑",
	"supdot": "⪾",
	"supdsub": "⫘",
	"supE": "⫆",
	"supe": "⊇",
	"supedot": "⫄",
	"Superset": "⊃",
	"SupersetEqual": "⊇",
	"suphsol": "⟉",
	"suphsub": "⫗",
	"suplarr": "⥻",
	"supmult": "⫂",
	"supnE": "⫌",
	"supne": "⊋",
	"supplus": "⫀",
	"supset": "⊃",
	"Supset": "⋑",
	"supseteq": "⊇",
	"supseteqq": "⫆",
	"supsetneq": "⊋",
	"supsetneqq": "⫌",
	"supsim": "⫈",
	"supsub": "⫔",
	"supsup": "⫖",
	"swarhk": "⤦",
	"swarr": "↙",
	"swArr": "⇙",
	"swarrow": "↙",
	"swnwar": "⤪",
	"szlig": "ß",
	"Tab": "\t",
	"target": "⌖",
	"Tau": "Τ",
	"tau": "τ",
	"tbrk": "⎴",
	"Tcaron": "Ť",
	"tcaron": "ť",
	"Tcedil": "Ţ",
	"tcedil": "ţ",
	"Tcy": "Т",
	"tcy": "т",
	"tdot": "⃛",
	"telrec": "⌕",
	"Tfr": "𝔗",
	"tfr": "𝔱",
	"there4": "∴",
	"therefore": "∴",
	"Therefore": "∴",
	"Theta": "Θ",
	"theta": "θ",
	"thetasym": "ϑ",
	"thetav": "ϑ",
	"thickapprox": "≈",
	"thicksim": "∼",
	"ThickSpace": "  ",
	"ThinSpace": " ",
	"thinsp": " ",
	"thkap": "≈",
	"thksim": "∼",
	"THORN": "Þ",
	"thorn": "þ",
	"tilde": "˜",
	"Tilde": "∼",
	"TildeEqual": "≃",
	"TildeFullEqual": "≅",
	"TildeTilde": "≈",
	"timesbar": "⨱",
	"timesb": "⊠",
	"times": "×",
	"timesd": "⨰",
	"tint": "∭",
	"toea": "⤨",
	"topbot": "⌶",
	"topcir": "⫱",
	"top": "⊤",
	"Topf": "𝕋",
	"topf": "𝕥",
	"topfork": "⫚",
	"tosa": "⤩",
	"tprime": "‴",
	"trade": "™",
	"TRADE": "™",
	"triangle": "▵",
	"triangledown": "▿",
	"triangleleft": "◃",
	"trianglelefteq": "⊴",
	"triangleq": "≜",
	"triangleright": "▹",
	"trianglerighteq": "⊵",
	"tridot": "◬",
	"trie": "≜",
	"triminus": "⨺",
	"TripleDot": "⃛",
	"triplus": "⨹",
	"trisb": "⧍",
	"tritime": "⨻",
	"trpezium": "⏢",
	"Tscr": "𝒯",
	"tscr": "𝓉",
	"TScy": "Ц",
	"tscy": "ц",
	"TSHcy": "Ћ",
	"tshcy": "ћ",
	"Tstrok": "Ŧ",
	"tstrok": "ŧ",
	"twixt": "≬",
	"twoheadleftarrow": "↞",
	"twoheadrightarrow": "↠",
	"Uacute": "Ú",
	"uacute": "ú",
	"uarr": "↑",
	"Uarr": "↟",
	"uArr": "⇑",
	"Uarrocir": "⥉",
	"Ubrcy": "Ў",
	"ubrcy": "ў",
	"Ubreve": "Ŭ",
	"ubreve": "ŭ",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ucy": "У",
	"ucy": "у",
	"udarr": "⇅",
	"Udblac": "Ű",
	"udblac": "ű",
	"udhar": "⥮",
	"ufisht": "⥾",
	"Ufr": "𝔘",
	"ufr": "𝔲",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uHar": "⥣",
	"uharl": "↿",
	"uharr": "↾",
	"uhblk": "▀",
	"ulcorn": "⌜",
	"ulcorner": "⌜",
	"ulcrop": "⌏",
	"ultri": "◸",
	"Umacr": "Ū",
	"umacr": "ū",
	"uml": "¨",
	"UnderBar": "_",
	"UnderBrace": "⏟",
	"UnderBracket": "⎵",
	"UnderParenthesis": "⏝",
	"Union": "⋃",
	"UnionPlus": "⊎",
	"Uogon": "Ų",
	"uogon": "ų",
	"Uopf": "𝕌",
	"uopf": "𝕦",
	"UpArrowBar": "⤒",
	"uparrow": "↑",
	"UpArrow": "↑",
	"Uparrow": "⇑",
	"UpArrowDownArrow": "⇅",
	"updownarrow": "↕",
	"UpDownArrow": "↕",
	"Updownarrow": "⇕",
	"UpEquilibrium": "⥮",
	"upharpoonleft": "↿",
	"upharpoonright": "↾",
	"uplus": "⊎",
	"UpperLeftArrow": "↖",
	"UpperRightArrow": "↗",
	"upsi": "υ",
	"Upsi": "ϒ",
	"upsih": "ϒ",
	"Upsilon": "Υ",
	"upsilon": "υ",
	"UpTeeArrow": "↥",
	"UpTee": "⊥",
	"upuparrows": "⇈",
	"urcorn": "⌝",
	"urcorner": "⌝",
	"urcrop": "⌎",
	"Uring": "Ů",
	"uring": "ů",
	"urtri": "◹",
	"Uscr": "𝒰",
	"uscr": "𝓊",
	"utdot": "⋰",
	"Utilde": "Ũ",
	"utilde": "ũ",
	"utri": "▵",
	"utrif": "▴",
	"uuarr": "⇈",
	"Uuml": "Ü",
	"uuml": "ü",
	"uwangle": "⦧",
	"vangrt": "⦜",
	"varepsilon": "ϵ",
	"varkappa": "ϰ",
	"varnothing": "∅",
	"varphi": "ϕ",
	"varpi": "ϖ",
	"varpropto": "∝",
	"varr": "↕",
	"vArr": "⇕",
	"varrho": "ϱ",
	"varsigma": "ς",
	"varsubsetneq": "⊊︀",
	"varsubsetneqq": "⫋︀",
	"varsupsetneq": "⊋︀",
	"varsupsetneqq": "⫌︀",
	"vartheta": "ϑ",
	"vartriangleleft": "⊲",
	"vartriangleright": "⊳",
	"vBar": "⫨",
	"Vbar": "⫫",
	"vBarv": "⫩",
	"Vcy": "В",
	"vcy": "в",
	"vdash": "⊢",
	"vDash": "⊨",
	"Vdash": "⊩",
	"VDash": "⊫",
	"Vdashl": "⫦",
	"veebar": "⊻",
	"vee": "∨",
	"Vee": "⋁",
	"veeeq": "≚",
	"vellip": "⋮",
	"verbar": "|",
	"Verbar": "‖",
	"vert": "|",
	"Vert": "‖",
	"VerticalBar": "∣",
	"VerticalLine": "|",
	"VerticalSeparator": "❘",
	"VerticalTilde": "≀",
	"VeryThinSpace": " ",
	"Vfr": "𝔙",
	"vfr": "𝔳",
	"vltri": "⊲",
	"vnsub": "⊂⃒",
	"vnsup": "⊃⃒",
	"Vopf": "𝕍",
	"vopf": "𝕧",
	"vprop": "∝",
	"vrtri": "⊳",
	"Vscr": "𝒱",
	"vscr": "𝓋",
	"vsubnE": "⫋︀",
	"vsubne": "⊊︀",
	"vsupnE": "⫌︀",
	"vsupne": "⊋︀",
	"Vvdash": "⊪",
	"vzigzag": "⦚",
	"Wcirc": "Ŵ",
	"wcirc": "ŵ",
	"wedbar": "⩟",
	"wedge": "∧",
	"Wedge": "⋀",
	"wedgeq": "≙",
	"weierp": "℘",
	"Wfr": "𝔚",
	"wfr": "𝔴",
	"Wopf": "𝕎",
	"wopf": "𝕨",
	"wp": "℘",
	"wr": "≀",
	"wreath": "≀",
	"Wscr": "𝒲",
	"wscr": "𝓌",
	"xcap": "⋂",
	"xcirc": "◯",
	"xcup": "⋃",
	"xdtri": "▽",
	"Xfr": "𝔛",
	"xfr": "𝔵",
	"xharr": "⟷",
	"xhArr": "⟺",
	"Xi": "Ξ",
	"xi": "ξ",
	"xlarr": "⟵",
	"xlArr": "⟸",
	"xmap": "⟼",
	"xnis": "⋻",
	"xodot": "⨀",
	"Xopf": "𝕏",
	"xopf": "𝕩",
	"xoplus": "⨁",
	"xotime": "⨂",
	"xrarr": "⟶",
	"xrArr": "⟹",
	"Xscr": "𝒳",
	"xscr": "𝓍",
	"xsqcup": "⨆",
	"xuplus": "⨄",
	"xutri": "△",
	"xvee": "⋁",
	"xwedge": "⋀",
	"Yacute": "Ý",
	"yacute": "ý",
	"YAcy": "Я",
	"yacy": "я",
	"Ycirc": "Ŷ",
	"ycirc": "ŷ",
	"Ycy": "Ы",
	"ycy": "ы",
	"yen": "¥",
	"Yfr": "𝔜",
	"yfr": "𝔶",
	"YIcy": "Ї",
	"yicy": "ї",
	"Yopf": "𝕐",
	"yopf": "𝕪",
	"Yscr": "𝒴",
	"yscr": "𝓎",
	"YUcy": "Ю",
	"yucy": "ю",
	"yuml": "ÿ",
	"Yuml": "Ÿ",
	"Zacute": "Ź",
	"zacute": "ź",
	"Zcaron": "Ž",
	"zcaron": "ž",
	"Zcy": "З",
	"zcy": "з",
	"Zdot": "Ż",
	"zdot": "ż",
	"zeetrf": "ℨ",
	"ZeroWidthSpace": "​",
	"Zeta": "Ζ",
	"zeta": "ζ",
	"zfr": "𝔷",
	"Zfr": "ℨ",
	"ZHcy": "Ж",
	"zhcy": "ж",
	"zigrarr": "⇝",
	"zopf": "𝕫",
	"Zopf": "ℤ",
	"Zscr": "𝒵",
	"zscr": "𝓏",
	"zwj": "‍",
	"zwnj": "‌"
};

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = {
	"amp": "&",
	"apos": "'",
	"gt": ">",
	"lt": "<",
	"quot": "\""
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = __webpack_require__(1).Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



module.exports = Writable;

/*<replacement>*/
var processNextTick = __webpack_require__(14);
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = __webpack_require__(4);
util.inherits = __webpack_require__(0);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(64)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(28);
/*</replacement>*/

var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(10);
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || __webpack_require__(2);

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(2);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = Buffer.isBuffer(chunk);

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    chunk = decodeChunk(state, chunk, encoding);
    if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8), __webpack_require__(63).setImmediate))

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(26);
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(15);
exports.Duplex = __webpack_require__(2);
exports.Transform = __webpack_require__(27);
exports.PassThrough = __webpack_require__(56);


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var htmlparser = __webpack_require__(6);
var constitutionText = __webpack_require__(29);
var amendmentsText = __webpack_require__(48);
function clearDefaultDOMSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {
            // Chrome
            window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
        }
    }
    else {
        // pre IE 9, unsupported
    }
}
exports.clearDefaultDOMSelection = clearDefaultDOMSelection;
function getHighlightedNodes(nodes, range) {
    var startRange = range[0];
    var endRange = range[1];
    var documentNodes = [];
    var highlightedNodes = [];
    for (var idx = 0; idx < nodes.length; idx++) {
        if (nodes[idx + 1]) {
            if (parseInt(nodes[idx + 1].props.data) < startRange) {
                continue;
            }
        }
        if (parseInt(nodes[idx].props.data) > endRange) {
            break;
        }
        documentNodes = documentNodes.concat(nodes.slice(idx, idx + 1));
    }
    // documentNodes is a new array with only the nodes containing text to be highlighted
    if (documentNodes.length === 1) {
        var offset = parseInt(documentNodes[0].props.data);
        var startIndex = startRange - offset;
        var endIndex = endRange - offset;
        var newSpan = React.createElement("span", {
            className: "editor__document-highlight",
            key: "somekey"
        }, documentNodes[0].innerHTML.toString().substring(startIndex, endIndex));
        var newNode = Object.assign({}, documentNodes[0]);
        var length_1 = documentNodes[0].innerHTML.toString().length;
        newNode.innerHTML = [
            newNode.innerHTML.toString().substring(0, startIndex),
            newSpan,
            newNode.innerHTML.toString().substring(endIndex, length_1)
        ];
        highlightedNodes = [newNode];
    }
    else {
        // More than one DOM node highlighted
        var offset = parseInt(documentNodes[0].props.data);
        var length_2 = documentNodes[0].innerHTML.toString().length;
        var startIndex = startRange - offset;
        var endIndex = length_2;
        var newSpan = React.createElement("span", {
            className: "editor__document-highlight",
            key: "somekey"
        }, documentNodes[0].innerHTML.toString().substring(startIndex, endIndex));
        var newNode = Object.assign({}, documentNodes[0]);
        newNode.innerHTML = [
            newNode.innerHTML.toString().substring(0, startIndex),
            newSpan
        ];
        highlightedNodes = [newNode];
        for (var index = 1; index < documentNodes.length; index++) {
            offset = parseInt(documentNodes[index].props.data);
            length_2 = documentNodes[index].innerHTML.toString().length;
            startIndex = 0;
            if (documentNodes[index + 1]) {
                // The selection continues beyond this one
                endIndex = length_2;
            }
            else {
                // This is the final node in the selection
                endIndex = endRange - offset;
            }
            var newSpan_1 = React.createElement("span", {
                className: "editor__document-highlight",
                key: "somekey"
            }, documentNodes[index].innerHTML
                .toString()
                .substring(startIndex, endIndex));
            var newNode_1 = Object.assign({}, documentNodes[index]);
            newNode_1.innerHTML = [
                newSpan_1,
                newNode_1.innerHTML.toString().substring(endIndex, length_2)
            ];
            highlightedNodes = highlightedNodes.concat([newNode_1]);
        }
    }
    return highlightedNodes;
}
exports.getHighlightedNodes = getHighlightedNodes;
function highlightText(range, nodes, type, childNodes, handleSetClick) {
    var firstIndexClassName = "constitution__row";
    var secondIndexClassName = "constitution__text";
    var foundationClassName = "constitution__text--selected";
    switch (type) {
        case "AMENDMENTS":
            firstIndexClassName = "amendments__row";
            secondIndexClassName = "amendments__text";
            foundationClassName = "amendments__text--selected";
            break;
        case "CONSTITUTION":
            firstIndexClassName = "constitution__row";
            secondIndexClassName = "constitution__text";
            foundationClassName = "constitution__text--selected";
            break;
        default:
            break;
    }
    var indexOfStartContainer = Array.prototype.indexOf.call(range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
    range.startContainer.parentNode); //Find indexOf current Node
    var indexOfSelectionStart = range.startOffset;
    var indexOfEndContainer = Array.prototype.indexOf.call(range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
    range.endContainer.parentNode); //Find indexOf current Node
    var indexOfSelectionEnd = range.endOffset;
    var foundationIndex;
    var firstNodeList = childNodes;
    for (var i = 0; i < firstNodeList.length; i++) {
        for (var j = 0; j < firstNodeList[i].attributes.length; j++) {
            if (firstNodeList[i].attributes.item(j).value == firstIndexClassName) {
                foundationIndex = i;
                break;
            }
        }
        if (foundationIndex !== undefined) {
            break;
        }
    }
    var secondIndex; //constitution | amendments
    var secondNodeList = firstNodeList[foundationIndex].childNodes;
    for (var i = 0; i < secondNodeList.length; i++) {
        for (var j = 0; j < secondNodeList[i].attributes.length; j++) {
            if (secondNodeList[i].attributes.item(j).value == secondIndexClassName) {
                secondIndex = i;
                break;
            }
        }
        if (secondIndex !== undefined) {
            break;
        }
    }
    var startContainer = firstNodeList[foundationIndex].childNodes[secondIndex].childNodes[indexOfStartContainer];
    var endContainer = firstNodeList[foundationIndex].childNodes[secondIndex].childNodes[indexOfEndContainer];
    var newNodes = nodes.slice(0, indexOfStartContainer).slice();
    if (startContainer === endContainer) {
        // Create a new Span element with the contents of the highlighted text
        var newSpan = React.createElement("span", {
            className: foundationClassName,
            key: "someKey",
            onClick: handleSetClick
        }, startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd));
        // Modify state array immutably
        var newNode = Object.assign({}, nodes[indexOfStartContainer]);
        newNode.innerHTML = [
            startContainer.textContent.substring(0, indexOfSelectionStart),
            newSpan,
            startContainer.textContent.substring(indexOfSelectionEnd, startContainer.textContent.length)
        ];
        newNodes = newNodes.concat([newNode]);
    }
    else {
        // Create a new Span element with the contents of the highlighted text
        var firstNewSpan = React.createElement("span", {
            className: foundationClassName,
            key: "someKey",
            onClick: handleSetClick
        }, startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length));
        // Modify state array immutably
        var firstNewNode = Object.assign({}, nodes[indexOfStartContainer]);
        firstNewNode.innerHTML = [
            startContainer.textContent.substring(0, indexOfSelectionStart),
            firstNewSpan
        ];
        newNodes = newNodes.concat([firstNewNode]);
        for (var index = indexOfStartContainer + 1; index < indexOfEndContainer; index++) {
            var nextNewNode = Object.assign({}, nodes[index]);
            var nextNewSpan = React.createElement("span", {
                className: foundationClassName,
                key: "someKey",
                onClick: handleSetClick
            }, nextNewNode.innerHTML);
            nextNewNode.innerHTML = [nextNewSpan];
            newNodes = newNodes.concat([nextNewNode]);
        }
        // Create a new Span element with the contents of the highlighted text
        var lastNewSpan = React.createElement("span", {
            className: foundationClassName,
            key: "someKey",
            onClick: handleSetClick
        }, endContainer.textContent.substring(0, indexOfSelectionEnd));
        // Modify state array immutably
        var lastNewNode = Object.assign({}, nodes[indexOfEndContainer]);
        lastNewNode.innerHTML = [
            lastNewSpan,
            endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length)
        ];
        newNodes = newNodes.concat([lastNewNode]);
    }
    newNodes = newNodes.concat(nodes.slice(indexOfEndContainer + 1, nodes.length));
    clearDefaultDOMSelection();
    var rangeStart = parseInt(startContainer.attributes[0].value) + indexOfSelectionStart;
    var rangeEnd = parseInt(endContainer.attributes[0].value) + indexOfSelectionEnd;
    return {
        newNodes: newNodes,
        range: [rangeStart, rangeEnd]
    };
}
exports.highlightText = highlightText;
/**
 *  Create an array of React elements for each Node in a given HTML string.
 *
 *  Assumes no child nodes in HTML string input.
 */
function getNodeArray(type) {
    var source;
    switch (type) {
        case "AMENDMENTS":
            source = amendmentsText;
            break;
        case "CONSTITUTION":
            source = constitutionText;
            break;
        default:
            break;
    }
    var output = [];
    var tagIsOpen = false;
    var newElementName;
    var newElementProps;
    var newElementText;
    var iter = 0;
    var parser = new htmlparser.Parser({
        onopentag: function (name, attributes) {
            tagIsOpen = true;
            newElementName = name;
            newElementProps = attributes;
        },
        ontext: function (text) {
            if (tagIsOpen) {
                newElementText = text;
            }
            // Ignore text between tags, usually this is just a blank space
        },
        onclosetag: function (name) {
            tagIsOpen = false;
            output.push({
                component: newElementName,
                props: newElementProps,
                innerHTML: [newElementText]
            });
        },
        onerror: function (error) {
            throw error;
        }
    });
    parser.write(source);
    parser.end();
    return output;
}
exports.getNodeArray = getNodeArray;
exports.default = {};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

// This object will be used as the prototype for Nodes when creating a
// DOM-Level-1-compliant structure.
var NodePrototype = module.exports = {
	get firstChild() {
		var children = this.children;
		return children && children[0] || null;
	},
	get lastChild() {
		var children = this.children;
		return children && children[children.length - 1] || null;
	},
	get nodeType() {
		return nodeTypes[this.type] || nodeTypes.element;
	}
};

var domLvl1 = {
	tagName: "name",
	childNodes: "children",
	parentNode: "parent",
	previousSibling: "prev",
	nextSibling: "next",
	nodeValue: "data"
};

var nodeTypes = {
	element: 1,
	text: 3,
	cdata: 4,
	comment: 8
};

Object.keys(domLvl1).forEach(function(key) {
	var shorthand = domLvl1[key];
	Object.defineProperty(NodePrototype, key, {
		get: function() {
			return this[shorthand] || null;
		},
		set: function(val) {
			this[shorthand] = val;
			return val;
		}
	});
});


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var decodeMap = __webpack_require__(47);

module.exports = decodeCodePoint;

// modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
function decodeCodePoint(codePoint){

	if((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF){
		return "\uFFFD";
	}

	if(codePoint in decodeMap){
		codePoint = decodeMap[codePoint];
	}

	var output = "";

	if(codePoint > 0xFFFF){
		codePoint -= 0x10000;
		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x3FF;
	}

	output += String.fromCharCode(codePoint);
	return output;
}


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"AElig": "Æ",
	"aelig": "æ",
	"Agrave": "À",
	"agrave": "à",
	"amp": "&",
	"AMP": "&",
	"Aring": "Å",
	"aring": "å",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"brvbar": "¦",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"cedil": "¸",
	"cent": "¢",
	"copy": "©",
	"COPY": "©",
	"curren": "¤",
	"deg": "°",
	"divide": "÷",
	"Eacute": "É",
	"eacute": "é",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"Egrave": "È",
	"egrave": "è",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"frac12": "½",
	"frac14": "¼",
	"frac34": "¾",
	"gt": ">",
	"GT": ">",
	"Iacute": "Í",
	"iacute": "í",
	"Icirc": "Î",
	"icirc": "î",
	"iexcl": "¡",
	"Igrave": "Ì",
	"igrave": "ì",
	"iquest": "¿",
	"Iuml": "Ï",
	"iuml": "ï",
	"laquo": "«",
	"lt": "<",
	"LT": "<",
	"macr": "¯",
	"micro": "µ",
	"middot": "·",
	"nbsp": " ",
	"not": "¬",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"Oacute": "Ó",
	"oacute": "ó",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"Ograve": "Ò",
	"ograve": "ò",
	"ordf": "ª",
	"ordm": "º",
	"Oslash": "Ø",
	"oslash": "ø",
	"Otilde": "Õ",
	"otilde": "õ",
	"Ouml": "Ö",
	"ouml": "ö",
	"para": "¶",
	"plusmn": "±",
	"pound": "£",
	"quot": "\"",
	"QUOT": "\"",
	"raquo": "»",
	"reg": "®",
	"REG": "®",
	"sect": "§",
	"shy": "­",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"szlig": "ß",
	"THORN": "Þ",
	"thorn": "þ",
	"times": "×",
	"Uacute": "Ú",
	"uacute": "ú",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uml": "¨",
	"Uuml": "Ü",
	"uuml": "ü",
	"Yacute": "Ý",
	"yacute": "ý",
	"yen": "¥",
	"yuml": "ÿ"
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var Tokenizer = __webpack_require__(23);

/*
	Options:

	xmlMode: Disables the special behavior for script/style tags (false by default)
	lowerCaseAttributeNames: call .toLowerCase for each attribute name (true if xmlMode is `false`)
	lowerCaseTags: call .toLowerCase for each tag name (true if xmlMode is `false`)
*/

/*
	Callbacks:

	oncdataend,
	oncdatastart,
	onclosetag,
	oncomment,
	oncommentend,
	onerror,
	onopentag,
	onprocessinginstruction,
	onreset,
	ontext
*/

var formTags = {
	input: true,
	option: true,
	optgroup: true,
	select: true,
	button: true,
	datalist: true,
	textarea: true
};

var openImpliesClose = {
	tr      : { tr:true, th:true, td:true },
	th      : { th:true },
	td      : { thead:true, th:true, td:true },
	body    : { head:true, link:true, script:true },
	li      : { li:true },
	p       : { p:true },
	h1      : { p:true },
	h2      : { p:true },
	h3      : { p:true },
	h4      : { p:true },
	h5      : { p:true },
	h6      : { p:true },
	select  : formTags,
	input   : formTags,
	output  : formTags,
	button  : formTags,
	datalist: formTags,
	textarea: formTags,
	option  : { option:true },
	optgroup: { optgroup:true }
};

var voidElements = {
	__proto__: null,
	area: true,
	base: true,
	basefont: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	frame: true,
	hr: true,
	img: true,
	input: true,
	isindex: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,

	//common self closing svg elements
	path: true,
	circle: true,
	ellipse: true,
	line: true,
	rect: true,
	use: true,
	stop: true,
	polyline: true,
	polygon: true
};

var re_nameEnd = /\s|\//;

function Parser(cbs, options){
	this._options = options || {};
	this._cbs = cbs || {};

	this._tagname = "";
	this._attribname = "";
	this._attribvalue = "";
	this._attribs = null;
	this._stack = [];

	this.startIndex = 0;
	this.endIndex = null;

	this._lowerCaseTagNames = "lowerCaseTags" in this._options ?
									!!this._options.lowerCaseTags :
									!this._options.xmlMode;
	this._lowerCaseAttributeNames = "lowerCaseAttributeNames" in this._options ?
									!!this._options.lowerCaseAttributeNames :
									!this._options.xmlMode;

	if(this._options.Tokenizer) {
		Tokenizer = this._options.Tokenizer;
	}
	this._tokenizer = new Tokenizer(this._options, this);

	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
}

__webpack_require__(0)(Parser, __webpack_require__(7).EventEmitter);

Parser.prototype._updatePosition = function(initialOffset){
	if(this.endIndex === null){
		if(this._tokenizer._sectionStart <= initialOffset){
			this.startIndex = 0;
		} else {
			this.startIndex = this._tokenizer._sectionStart - initialOffset;
		}
	}
	else this.startIndex = this.endIndex + 1;
	this.endIndex = this._tokenizer.getAbsoluteIndex();
};

//Tokenizer event handlers
Parser.prototype.ontext = function(data){
	this._updatePosition(1);
	this.endIndex--;

	if(this._cbs.ontext) this._cbs.ontext(data);
};

Parser.prototype.onopentagname = function(name){
	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	this._tagname = name;

	if(!this._options.xmlMode && name in openImpliesClose) {
		for(
			var el;
			(el = this._stack[this._stack.length - 1]) in openImpliesClose[name];
			this.onclosetag(el)
		);
	}

	if(this._options.xmlMode || !(name in voidElements)){
		this._stack.push(name);
	}

	if(this._cbs.onopentagname) this._cbs.onopentagname(name);
	if(this._cbs.onopentag) this._attribs = {};
};

Parser.prototype.onopentagend = function(){
	this._updatePosition(1);

	if(this._attribs){
		if(this._cbs.onopentag) this._cbs.onopentag(this._tagname, this._attribs);
		this._attribs = null;
	}

	if(!this._options.xmlMode && this._cbs.onclosetag && this._tagname in voidElements){
		this._cbs.onclosetag(this._tagname);
	}

	this._tagname = "";
};

Parser.prototype.onclosetag = function(name){
	this._updatePosition(1);

	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	if(this._stack.length && (!(name in voidElements) || this._options.xmlMode)){
		var pos = this._stack.lastIndexOf(name);
		if(pos !== -1){
			if(this._cbs.onclosetag){
				pos = this._stack.length - pos;
				while(pos--) this._cbs.onclosetag(this._stack.pop());
			}
			else this._stack.length = pos;
		} else if(name === "p" && !this._options.xmlMode){
			this.onopentagname(name);
			this._closeCurrentTag();
		}
	} else if(!this._options.xmlMode && (name === "br" || name === "p")){
		this.onopentagname(name);
		this._closeCurrentTag();
	}
};

Parser.prototype.onselfclosingtag = function(){
	if(this._options.xmlMode || this._options.recognizeSelfClosing){
		this._closeCurrentTag();
	} else {
		this.onopentagend();
	}
};

Parser.prototype._closeCurrentTag = function(){
	var name = this._tagname;

	this.onopentagend();

	//self-closing tags will be on the top of the stack
	//(cheaper check than in onclosetag)
	if(this._stack[this._stack.length - 1] === name){
		if(this._cbs.onclosetag){
			this._cbs.onclosetag(name);
		}
		this._stack.pop();
	}
};

Parser.prototype.onattribname = function(name){
	if(this._lowerCaseAttributeNames){
		name = name.toLowerCase();
	}
	this._attribname = name;
};

Parser.prototype.onattribdata = function(value){
	this._attribvalue += value;
};

Parser.prototype.onattribend = function(){
	if(this._cbs.onattribute) this._cbs.onattribute(this._attribname, this._attribvalue);
	if(
		this._attribs &&
		!Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)
	){
		this._attribs[this._attribname] = this._attribvalue;
	}
	this._attribname = "";
	this._attribvalue = "";
};

Parser.prototype._getInstructionName = function(value){
	var idx = value.search(re_nameEnd),
	    name = idx < 0 ? value : value.substr(0, idx);

	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	return name;
};

Parser.prototype.ondeclaration = function(value){
	if(this._cbs.onprocessinginstruction){
		var name = this._getInstructionName(value);
		this._cbs.onprocessinginstruction("!" + name, "!" + value);
	}
};

Parser.prototype.onprocessinginstruction = function(value){
	if(this._cbs.onprocessinginstruction){
		var name = this._getInstructionName(value);
		this._cbs.onprocessinginstruction("?" + name, "?" + value);
	}
};

Parser.prototype.oncomment = function(value){
	this._updatePosition(4);

	if(this._cbs.oncomment) this._cbs.oncomment(value);
	if(this._cbs.oncommentend) this._cbs.oncommentend();
};

Parser.prototype.oncdata = function(value){
	this._updatePosition(1);

	if(this._options.xmlMode || this._options.recognizeCDATA){
		if(this._cbs.oncdatastart) this._cbs.oncdatastart();
		if(this._cbs.ontext) this._cbs.ontext(value);
		if(this._cbs.oncdataend) this._cbs.oncdataend();
	} else {
		this.oncomment("[CDATA[" + value + "]]");
	}
};

Parser.prototype.onerror = function(err){
	if(this._cbs.onerror) this._cbs.onerror(err);
};

Parser.prototype.onend = function(){
	if(this._cbs.onclosetag){
		for(
			var i = this._stack.length;
			i > 0;
			this._cbs.onclosetag(this._stack[--i])
		);
	}
	if(this._cbs.onend) this._cbs.onend();
};


//Resets the parser to a blank state, ready to parse a new HTML document
Parser.prototype.reset = function(){
	if(this._cbs.onreset) this._cbs.onreset();
	this._tokenizer.reset();

	this._tagname = "";
	this._attribname = "";
	this._attribs = null;
	this._stack = [];

	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
};

//Parses a complete HTML document and pushes it to the handler
Parser.prototype.parseComplete = function(data){
	this.reset();
	this.end(data);
};

Parser.prototype.write = function(chunk){
	this._tokenizer.write(chunk);
};

Parser.prototype.end = function(chunk){
	this._tokenizer.end(chunk);
};

Parser.prototype.pause = function(){
	this._tokenizer.pause();
};

Parser.prototype.resume = function(){
	this._tokenizer.resume();
};

//alias for backwards compat
Parser.prototype.parseChunk = Parser.prototype.write;
Parser.prototype.done = Parser.prototype.end;

module.exports = Parser;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Tokenizer;

var decodeCodePoint = __webpack_require__(20),
    entityMap = __webpack_require__(11),
    legacyMap = __webpack_require__(21),
    xmlMap    = __webpack_require__(12),

    i = 0,

    TEXT                      = i++,
    BEFORE_TAG_NAME           = i++, //after <
    IN_TAG_NAME               = i++,
    IN_SELF_CLOSING_TAG       = i++,
    BEFORE_CLOSING_TAG_NAME   = i++,
    IN_CLOSING_TAG_NAME       = i++,
    AFTER_CLOSING_TAG_NAME    = i++,

    //attributes
    BEFORE_ATTRIBUTE_NAME     = i++,
    IN_ATTRIBUTE_NAME         = i++,
    AFTER_ATTRIBUTE_NAME      = i++,
    BEFORE_ATTRIBUTE_VALUE    = i++,
    IN_ATTRIBUTE_VALUE_DQ     = i++, // "
    IN_ATTRIBUTE_VALUE_SQ     = i++, // '
    IN_ATTRIBUTE_VALUE_NQ     = i++,

    //declarations
    BEFORE_DECLARATION        = i++, // !
    IN_DECLARATION            = i++,

    //processing instructions
    IN_PROCESSING_INSTRUCTION = i++, // ?

    //comments
    BEFORE_COMMENT            = i++,
    IN_COMMENT                = i++,
    AFTER_COMMENT_1           = i++,
    AFTER_COMMENT_2           = i++,

    //cdata
    BEFORE_CDATA_1            = i++, // [
    BEFORE_CDATA_2            = i++, // C
    BEFORE_CDATA_3            = i++, // D
    BEFORE_CDATA_4            = i++, // A
    BEFORE_CDATA_5            = i++, // T
    BEFORE_CDATA_6            = i++, // A
    IN_CDATA                  = i++, // [
    AFTER_CDATA_1             = i++, // ]
    AFTER_CDATA_2             = i++, // ]

    //special tags
    BEFORE_SPECIAL            = i++, //S
    BEFORE_SPECIAL_END        = i++,   //S

    BEFORE_SCRIPT_1           = i++, //C
    BEFORE_SCRIPT_2           = i++, //R
    BEFORE_SCRIPT_3           = i++, //I
    BEFORE_SCRIPT_4           = i++, //P
    BEFORE_SCRIPT_5           = i++, //T
    AFTER_SCRIPT_1            = i++, //C
    AFTER_SCRIPT_2            = i++, //R
    AFTER_SCRIPT_3            = i++, //I
    AFTER_SCRIPT_4            = i++, //P
    AFTER_SCRIPT_5            = i++, //T

    BEFORE_STYLE_1            = i++, //T
    BEFORE_STYLE_2            = i++, //Y
    BEFORE_STYLE_3            = i++, //L
    BEFORE_STYLE_4            = i++, //E
    AFTER_STYLE_1             = i++, //T
    AFTER_STYLE_2             = i++, //Y
    AFTER_STYLE_3             = i++, //L
    AFTER_STYLE_4             = i++, //E

    BEFORE_ENTITY             = i++, //&
    BEFORE_NUMERIC_ENTITY     = i++, //#
    IN_NAMED_ENTITY           = i++,
    IN_NUMERIC_ENTITY         = i++,
    IN_HEX_ENTITY             = i++, //X

    j = 0,

    SPECIAL_NONE              = j++,
    SPECIAL_SCRIPT            = j++,
    SPECIAL_STYLE             = j++;

function whitespace(c){
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

function characterState(char, SUCCESS){
	return function(c){
		if(c === char) this._state = SUCCESS;
	};
}

function ifElseState(upper, SUCCESS, FAILURE){
	var lower = upper.toLowerCase();

	if(upper === lower){
		return function(c){
			if(c === lower){
				this._state = SUCCESS;
			} else {
				this._state = FAILURE;
				this._index--;
			}
		};
	} else {
		return function(c){
			if(c === lower || c === upper){
				this._state = SUCCESS;
			} else {
				this._state = FAILURE;
				this._index--;
			}
		};
	}
}

function consumeSpecialNameChar(upper, NEXT_STATE){
	var lower = upper.toLowerCase();

	return function(c){
		if(c === lower || c === upper){
			this._state = NEXT_STATE;
		} else {
			this._state = IN_TAG_NAME;
			this._index--; //consume the token again
		}
	};
}

function Tokenizer(options, cbs){
	this._state = TEXT;
	this._buffer = "";
	this._sectionStart = 0;
	this._index = 0;
	this._bufferOffset = 0; //chars removed from _buffer
	this._baseState = TEXT;
	this._special = SPECIAL_NONE;
	this._cbs = cbs;
	this._running = true;
	this._ended = false;
	this._xmlMode = !!(options && options.xmlMode);
	this._decodeEntities = !!(options && options.decodeEntities);
}

Tokenizer.prototype._stateText = function(c){
	if(c === "<"){
		if(this._index > this._sectionStart){
			this._cbs.ontext(this._getSection());
		}
		this._state = BEFORE_TAG_NAME;
		this._sectionStart = this._index;
	} else if(this._decodeEntities && this._special === SPECIAL_NONE && c === "&"){
		if(this._index > this._sectionStart){
			this._cbs.ontext(this._getSection());
		}
		this._baseState = TEXT;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeTagName = function(c){
	if(c === "/"){
		this._state = BEFORE_CLOSING_TAG_NAME;
	} else if(c === "<"){
		this._cbs.ontext(this._getSection());
		this._sectionStart = this._index;
	} else if(c === ">" || this._special !== SPECIAL_NONE || whitespace(c)) {
		this._state = TEXT;
	} else if(c === "!"){
		this._state = BEFORE_DECLARATION;
		this._sectionStart = this._index + 1;
	} else if(c === "?"){
		this._state = IN_PROCESSING_INSTRUCTION;
		this._sectionStart = this._index + 1;
	} else {
		this._state = (!this._xmlMode && (c === "s" || c === "S")) ?
						BEFORE_SPECIAL : IN_TAG_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInTagName = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._emitToken("onopentagname");
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateBeforeCloseingTagName = function(c){
	if(whitespace(c));
	else if(c === ">"){
		this._state = TEXT;
	} else if(this._special !== SPECIAL_NONE){
		if(c === "s" || c === "S"){
			this._state = BEFORE_SPECIAL_END;
		} else {
			this._state = TEXT;
			this._index--;
		}
	} else {
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInCloseingTagName = function(c){
	if(c === ">" || whitespace(c)){
		this._emitToken("onclosetag");
		this._state = AFTER_CLOSING_TAG_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateAfterCloseingTagName = function(c){
	//skip everything until ">"
	if(c === ">"){
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateBeforeAttributeName = function(c){
	if(c === ">"){
		this._cbs.onopentagend();
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c === "/"){
		this._state = IN_SELF_CLOSING_TAG;
	} else if(!whitespace(c)){
		this._state = IN_ATTRIBUTE_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInSelfClosingTag = function(c){
	if(c === ">"){
		this._cbs.onselfclosingtag();
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(!whitespace(c)){
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateInAttributeName = function(c){
	if(c === "=" || c === "/" || c === ">" || whitespace(c)){
		this._cbs.onattribname(this._getSection());
		this._sectionStart = -1;
		this._state = AFTER_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateAfterAttributeName = function(c){
	if(c === "="){
		this._state = BEFORE_ATTRIBUTE_VALUE;
	} else if(c === "/" || c === ">"){
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	} else if(!whitespace(c)){
		this._cbs.onattribend();
		this._state = IN_ATTRIBUTE_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeAttributeValue = function(c){
	if(c === "\""){
		this._state = IN_ATTRIBUTE_VALUE_DQ;
		this._sectionStart = this._index + 1;
	} else if(c === "'"){
		this._state = IN_ATTRIBUTE_VALUE_SQ;
		this._sectionStart = this._index + 1;
	} else if(!whitespace(c)){
		this._state = IN_ATTRIBUTE_VALUE_NQ;
		this._sectionStart = this._index;
		this._index--; //reconsume token
	}
};

Tokenizer.prototype._stateInAttributeValueDoubleQuotes = function(c){
	if(c === "\""){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInAttributeValueSingleQuotes = function(c){
	if(c === "'"){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInAttributeValueNoQuotes = function(c){
	if(whitespace(c) || c === ">"){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeDeclaration = function(c){
	this._state = c === "[" ? BEFORE_CDATA_1 :
					c === "-" ? BEFORE_COMMENT :
						IN_DECLARATION;
};

Tokenizer.prototype._stateInDeclaration = function(c){
	if(c === ">"){
		this._cbs.ondeclaration(this._getSection());
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateInProcessingInstruction = function(c){
	if(c === ">"){
		this._cbs.onprocessinginstruction(this._getSection());
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateBeforeComment = function(c){
	if(c === "-"){
		this._state = IN_COMMENT;
		this._sectionStart = this._index + 1;
	} else {
		this._state = IN_DECLARATION;
	}
};

Tokenizer.prototype._stateInComment = function(c){
	if(c === "-") this._state = AFTER_COMMENT_1;
};

Tokenizer.prototype._stateAfterComment1 = function(c){
	if(c === "-"){
		this._state = AFTER_COMMENT_2;
	} else {
		this._state = IN_COMMENT;
	}
};

Tokenizer.prototype._stateAfterComment2 = function(c){
	if(c === ">"){
		//remove 2 trailing chars
		this._cbs.oncomment(this._buffer.substring(this._sectionStart, this._index - 2));
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c !== "-"){
		this._state = IN_COMMENT;
	}
	// else: stay in AFTER_COMMENT_2 (`--->`)
};

Tokenizer.prototype._stateBeforeCdata1 = ifElseState("C", BEFORE_CDATA_2, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata2 = ifElseState("D", BEFORE_CDATA_3, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata3 = ifElseState("A", BEFORE_CDATA_4, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata4 = ifElseState("T", BEFORE_CDATA_5, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata5 = ifElseState("A", BEFORE_CDATA_6, IN_DECLARATION);

Tokenizer.prototype._stateBeforeCdata6 = function(c){
	if(c === "["){
		this._state = IN_CDATA;
		this._sectionStart = this._index + 1;
	} else {
		this._state = IN_DECLARATION;
		this._index--;
	}
};

Tokenizer.prototype._stateInCdata = function(c){
	if(c === "]") this._state = AFTER_CDATA_1;
};

Tokenizer.prototype._stateAfterCdata1 = characterState("]", AFTER_CDATA_2);

Tokenizer.prototype._stateAfterCdata2 = function(c){
	if(c === ">"){
		//remove 2 trailing chars
		this._cbs.oncdata(this._buffer.substring(this._sectionStart, this._index - 2));
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c !== "]") {
		this._state = IN_CDATA;
	}
	//else: stay in AFTER_CDATA_2 (`]]]>`)
};

Tokenizer.prototype._stateBeforeSpecial = function(c){
	if(c === "c" || c === "C"){
		this._state = BEFORE_SCRIPT_1;
	} else if(c === "t" || c === "T"){
		this._state = BEFORE_STYLE_1;
	} else {
		this._state = IN_TAG_NAME;
		this._index--; //consume the token again
	}
};

Tokenizer.prototype._stateBeforeSpecialEnd = function(c){
	if(this._special === SPECIAL_SCRIPT && (c === "c" || c === "C")){
		this._state = AFTER_SCRIPT_1;
	} else if(this._special === SPECIAL_STYLE && (c === "t" || c === "T")){
		this._state = AFTER_STYLE_1;
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeScript1 = consumeSpecialNameChar("R", BEFORE_SCRIPT_2);
Tokenizer.prototype._stateBeforeScript2 = consumeSpecialNameChar("I", BEFORE_SCRIPT_3);
Tokenizer.prototype._stateBeforeScript3 = consumeSpecialNameChar("P", BEFORE_SCRIPT_4);
Tokenizer.prototype._stateBeforeScript4 = consumeSpecialNameChar("T", BEFORE_SCRIPT_5);

Tokenizer.prototype._stateBeforeScript5 = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._special = SPECIAL_SCRIPT;
	}
	this._state = IN_TAG_NAME;
	this._index--; //consume the token again
};

Tokenizer.prototype._stateAfterScript1 = ifElseState("R", AFTER_SCRIPT_2, TEXT);
Tokenizer.prototype._stateAfterScript2 = ifElseState("I", AFTER_SCRIPT_3, TEXT);
Tokenizer.prototype._stateAfterScript3 = ifElseState("P", AFTER_SCRIPT_4, TEXT);
Tokenizer.prototype._stateAfterScript4 = ifElseState("T", AFTER_SCRIPT_5, TEXT);

Tokenizer.prototype._stateAfterScript5 = function(c){
	if(c === ">" || whitespace(c)){
		this._special = SPECIAL_NONE;
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index - 6;
		this._index--; //reconsume the token
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeStyle1 = consumeSpecialNameChar("Y", BEFORE_STYLE_2);
Tokenizer.prototype._stateBeforeStyle2 = consumeSpecialNameChar("L", BEFORE_STYLE_3);
Tokenizer.prototype._stateBeforeStyle3 = consumeSpecialNameChar("E", BEFORE_STYLE_4);

Tokenizer.prototype._stateBeforeStyle4 = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._special = SPECIAL_STYLE;
	}
	this._state = IN_TAG_NAME;
	this._index--; //consume the token again
};

Tokenizer.prototype._stateAfterStyle1 = ifElseState("Y", AFTER_STYLE_2, TEXT);
Tokenizer.prototype._stateAfterStyle2 = ifElseState("L", AFTER_STYLE_3, TEXT);
Tokenizer.prototype._stateAfterStyle3 = ifElseState("E", AFTER_STYLE_4, TEXT);

Tokenizer.prototype._stateAfterStyle4 = function(c){
	if(c === ">" || whitespace(c)){
		this._special = SPECIAL_NONE;
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index - 5;
		this._index--; //reconsume the token
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeEntity = ifElseState("#", BEFORE_NUMERIC_ENTITY, IN_NAMED_ENTITY);
Tokenizer.prototype._stateBeforeNumericEntity = ifElseState("X", IN_HEX_ENTITY, IN_NUMERIC_ENTITY);

//for entities terminated with a semicolon
Tokenizer.prototype._parseNamedEntityStrict = function(){
	//offset = 1
	if(this._sectionStart + 1 < this._index){
		var entity = this._buffer.substring(this._sectionStart + 1, this._index),
		    map = this._xmlMode ? xmlMap : entityMap;

		if(map.hasOwnProperty(entity)){
			this._emitPartial(map[entity]);
			this._sectionStart = this._index + 1;
		}
	}
};


//parses legacy entities (without trailing semicolon)
Tokenizer.prototype._parseLegacyEntity = function(){
	var start = this._sectionStart + 1,
	    limit = this._index - start;

	if(limit > 6) limit = 6; //the max length of legacy entities is 6

	while(limit >= 2){ //the min length of legacy entities is 2
		var entity = this._buffer.substr(start, limit);

		if(legacyMap.hasOwnProperty(entity)){
			this._emitPartial(legacyMap[entity]);
			this._sectionStart += limit + 1;
			return;
		} else {
			limit--;
		}
	}
};

Tokenizer.prototype._stateInNamedEntity = function(c){
	if(c === ";"){
		this._parseNamedEntityStrict();
		if(this._sectionStart + 1 < this._index && !this._xmlMode){
			this._parseLegacyEntity();
		}
		this._state = this._baseState;
	} else if((c < "a" || c > "z") && (c < "A" || c > "Z") && (c < "0" || c > "9")){
		if(this._xmlMode);
		else if(this._sectionStart + 1 === this._index);
		else if(this._baseState !== TEXT){
			if(c !== "="){
				this._parseNamedEntityStrict();
			}
		} else {
			this._parseLegacyEntity();
		}

		this._state = this._baseState;
		this._index--;
	}
};

Tokenizer.prototype._decodeNumericEntity = function(offset, base){
	var sectionStart = this._sectionStart + offset;

	if(sectionStart !== this._index){
		//parse entity
		var entity = this._buffer.substring(sectionStart, this._index);
		var parsed = parseInt(entity, base);

		this._emitPartial(decodeCodePoint(parsed));
		this._sectionStart = this._index;
	} else {
		this._sectionStart--;
	}

	this._state = this._baseState;
};

Tokenizer.prototype._stateInNumericEntity = function(c){
	if(c === ";"){
		this._decodeNumericEntity(2, 10);
		this._sectionStart++;
	} else if(c < "0" || c > "9"){
		if(!this._xmlMode){
			this._decodeNumericEntity(2, 10);
		} else {
			this._state = this._baseState;
		}
		this._index--;
	}
};

Tokenizer.prototype._stateInHexEntity = function(c){
	if(c === ";"){
		this._decodeNumericEntity(3, 16);
		this._sectionStart++;
	} else if((c < "a" || c > "f") && (c < "A" || c > "F") && (c < "0" || c > "9")){
		if(!this._xmlMode){
			this._decodeNumericEntity(3, 16);
		} else {
			this._state = this._baseState;
		}
		this._index--;
	}
};

Tokenizer.prototype._cleanup = function (){
	if(this._sectionStart < 0){
		this._buffer = "";
		this._bufferOffset += this._index;
		this._index = 0;
	} else if(this._running){
		if(this._state === TEXT){
			if(this._sectionStart !== this._index){
				this._cbs.ontext(this._buffer.substr(this._sectionStart));
			}
			this._buffer = "";
			this._bufferOffset += this._index;
			this._index = 0;
		} else if(this._sectionStart === this._index){
			//the section just started
			this._buffer = "";
			this._bufferOffset += this._index;
			this._index = 0;
		} else {
			//remove everything unnecessary
			this._buffer = this._buffer.substr(this._sectionStart);
			this._index -= this._sectionStart;
			this._bufferOffset += this._sectionStart;
		}

		this._sectionStart = 0;
	}
};

//TODO make events conditional
Tokenizer.prototype.write = function(chunk){
	if(this._ended) this._cbs.onerror(Error(".write() after done!"));

	this._buffer += chunk;
	this._parse();
};

Tokenizer.prototype._parse = function(){
	while(this._index < this._buffer.length && this._running){
		var c = this._buffer.charAt(this._index);
		if(this._state === TEXT) {
			this._stateText(c);
		} else if(this._state === BEFORE_TAG_NAME){
			this._stateBeforeTagName(c);
		} else if(this._state === IN_TAG_NAME) {
			this._stateInTagName(c);
		} else if(this._state === BEFORE_CLOSING_TAG_NAME){
			this._stateBeforeCloseingTagName(c);
		} else if(this._state === IN_CLOSING_TAG_NAME){
			this._stateInCloseingTagName(c);
		} else if(this._state === AFTER_CLOSING_TAG_NAME){
			this._stateAfterCloseingTagName(c);
		} else if(this._state === IN_SELF_CLOSING_TAG){
			this._stateInSelfClosingTag(c);
		}

		/*
		*	attributes
		*/
		else if(this._state === BEFORE_ATTRIBUTE_NAME){
			this._stateBeforeAttributeName(c);
		} else if(this._state === IN_ATTRIBUTE_NAME){
			this._stateInAttributeName(c);
		} else if(this._state === AFTER_ATTRIBUTE_NAME){
			this._stateAfterAttributeName(c);
		} else if(this._state === BEFORE_ATTRIBUTE_VALUE){
			this._stateBeforeAttributeValue(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_DQ){
			this._stateInAttributeValueDoubleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_SQ){
			this._stateInAttributeValueSingleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_NQ){
			this._stateInAttributeValueNoQuotes(c);
		}

		/*
		*	declarations
		*/
		else if(this._state === BEFORE_DECLARATION){
			this._stateBeforeDeclaration(c);
		} else if(this._state === IN_DECLARATION){
			this._stateInDeclaration(c);
		}

		/*
		*	processing instructions
		*/
		else if(this._state === IN_PROCESSING_INSTRUCTION){
			this._stateInProcessingInstruction(c);
		}

		/*
		*	comments
		*/
		else if(this._state === BEFORE_COMMENT){
			this._stateBeforeComment(c);
		} else if(this._state === IN_COMMENT){
			this._stateInComment(c);
		} else if(this._state === AFTER_COMMENT_1){
			this._stateAfterComment1(c);
		} else if(this._state === AFTER_COMMENT_2){
			this._stateAfterComment2(c);
		}

		/*
		*	cdata
		*/
		else if(this._state === BEFORE_CDATA_1){
			this._stateBeforeCdata1(c);
		} else if(this._state === BEFORE_CDATA_2){
			this._stateBeforeCdata2(c);
		} else if(this._state === BEFORE_CDATA_3){
			this._stateBeforeCdata3(c);
		} else if(this._state === BEFORE_CDATA_4){
			this._stateBeforeCdata4(c);
		} else if(this._state === BEFORE_CDATA_5){
			this._stateBeforeCdata5(c);
		} else if(this._state === BEFORE_CDATA_6){
			this._stateBeforeCdata6(c);
		} else if(this._state === IN_CDATA){
			this._stateInCdata(c);
		} else if(this._state === AFTER_CDATA_1){
			this._stateAfterCdata1(c);
		} else if(this._state === AFTER_CDATA_2){
			this._stateAfterCdata2(c);
		}

		/*
		* special tags
		*/
		else if(this._state === BEFORE_SPECIAL){
			this._stateBeforeSpecial(c);
		} else if(this._state === BEFORE_SPECIAL_END){
			this._stateBeforeSpecialEnd(c);
		}

		/*
		* script
		*/
		else if(this._state === BEFORE_SCRIPT_1){
			this._stateBeforeScript1(c);
		} else if(this._state === BEFORE_SCRIPT_2){
			this._stateBeforeScript2(c);
		} else if(this._state === BEFORE_SCRIPT_3){
			this._stateBeforeScript3(c);
		} else if(this._state === BEFORE_SCRIPT_4){
			this._stateBeforeScript4(c);
		} else if(this._state === BEFORE_SCRIPT_5){
			this._stateBeforeScript5(c);
		}

		else if(this._state === AFTER_SCRIPT_1){
			this._stateAfterScript1(c);
		} else if(this._state === AFTER_SCRIPT_2){
			this._stateAfterScript2(c);
		} else if(this._state === AFTER_SCRIPT_3){
			this._stateAfterScript3(c);
		} else if(this._state === AFTER_SCRIPT_4){
			this._stateAfterScript4(c);
		} else if(this._state === AFTER_SCRIPT_5){
			this._stateAfterScript5(c);
		}

		/*
		* style
		*/
		else if(this._state === BEFORE_STYLE_1){
			this._stateBeforeStyle1(c);
		} else if(this._state === BEFORE_STYLE_2){
			this._stateBeforeStyle2(c);
		} else if(this._state === BEFORE_STYLE_3){
			this._stateBeforeStyle3(c);
		} else if(this._state === BEFORE_STYLE_4){
			this._stateBeforeStyle4(c);
		}

		else if(this._state === AFTER_STYLE_1){
			this._stateAfterStyle1(c);
		} else if(this._state === AFTER_STYLE_2){
			this._stateAfterStyle2(c);
		} else if(this._state === AFTER_STYLE_3){
			this._stateAfterStyle3(c);
		} else if(this._state === AFTER_STYLE_4){
			this._stateAfterStyle4(c);
		}

		/*
		* entities
		*/
		else if(this._state === BEFORE_ENTITY){
			this._stateBeforeEntity(c);
		} else if(this._state === BEFORE_NUMERIC_ENTITY){
			this._stateBeforeNumericEntity(c);
		} else if(this._state === IN_NAMED_ENTITY){
			this._stateInNamedEntity(c);
		} else if(this._state === IN_NUMERIC_ENTITY){
			this._stateInNumericEntity(c);
		} else if(this._state === IN_HEX_ENTITY){
			this._stateInHexEntity(c);
		}

		else {
			this._cbs.onerror(Error("unknown _state"), this._state);
		}

		this._index++;
	}

	this._cleanup();
};

Tokenizer.prototype.pause = function(){
	this._running = false;
};
Tokenizer.prototype.resume = function(){
	this._running = true;

	if(this._index < this._buffer.length){
		this._parse();
	}
	if(this._ended){
		this._finish();
	}
};

Tokenizer.prototype.end = function(chunk){
	if(this._ended) this._cbs.onerror(Error(".end() after done!"));
	if(chunk) this.write(chunk);

	this._ended = true;

	if(this._running) this._finish();
};

Tokenizer.prototype._finish = function(){
	//if there is remaining data, emit it in a reasonable way
	if(this._sectionStart < this._index){
		this._handleTrailingData();
	}

	this._cbs.onend();
};

Tokenizer.prototype._handleTrailingData = function(){
	var data = this._buffer.substr(this._sectionStart);

	if(this._state === IN_CDATA || this._state === AFTER_CDATA_1 || this._state === AFTER_CDATA_2){
		this._cbs.oncdata(data);
	} else if(this._state === IN_COMMENT || this._state === AFTER_COMMENT_1 || this._state === AFTER_COMMENT_2){
		this._cbs.oncomment(data);
	} else if(this._state === IN_NAMED_ENTITY && !this._xmlMode){
		this._parseLegacyEntity();
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(this._state === IN_NUMERIC_ENTITY && !this._xmlMode){
		this._decodeNumericEntity(2, 10);
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(this._state === IN_HEX_ENTITY && !this._xmlMode){
		this._decodeNumericEntity(3, 16);
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(
		this._state !== IN_TAG_NAME &&
		this._state !== BEFORE_ATTRIBUTE_NAME &&
		this._state !== BEFORE_ATTRIBUTE_VALUE &&
		this._state !== AFTER_ATTRIBUTE_NAME &&
		this._state !== IN_ATTRIBUTE_NAME &&
		this._state !== IN_ATTRIBUTE_VALUE_SQ &&
		this._state !== IN_ATTRIBUTE_VALUE_DQ &&
		this._state !== IN_ATTRIBUTE_VALUE_NQ &&
		this._state !== IN_CLOSING_TAG_NAME
	){
		this._cbs.ontext(data);
	}
	//else, ignore remaining data
	//TODO add a way to remove current tag
};

Tokenizer.prototype.reset = function(){
	Tokenizer.call(this, {xmlMode: this._xmlMode, decodeEntities: this._decodeEntities}, this._cbs);
};

Tokenizer.prototype.getAbsoluteIndex = function(){
	return this._bufferOffset + this._index;
};

Tokenizer.prototype._getSection = function(){
	return this._buffer.substring(this._sectionStart, this._index);
};

Tokenizer.prototype._emitToken = function(name){
	this._cbs[name](this._getSection());
	this._sectionStart = -1;
};

Tokenizer.prototype._emitPartial = function(value){
	if(this._baseState !== TEXT){
		this._cbs.onattribdata(value); //TODO implement the new event
	} else {
		this._cbs.ontext(value);
	}
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Stream;

var Parser = __webpack_require__(22),
    WritableStream = __webpack_require__(62).Writable || __webpack_require__(65).Writable,
    StringDecoder = __webpack_require__(13).StringDecoder,
    Buffer = __webpack_require__(1).Buffer;

function Stream(cbs, options){
	var parser = this._parser = new Parser(cbs, options);
	var decoder = this._decoder = new StringDecoder();

	WritableStream.call(this, {decodeStrings: false});

	this.once("finish", function(){
		parser.end(decoder.end());
	});
}

__webpack_require__(0)(Stream, WritableStream);

WritableStream.prototype._write = function(chunk, encoding, cb){
	if(chunk instanceof Buffer) chunk = this._decoder.write(chunk);
	this._parser.write(chunk);
	cb();
};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

module.exports = Readable;

/*<replacement>*/
var processNextTick = __webpack_require__(14);
/*</replacement>*/

/*<replacement>*/
var isArray = __webpack_require__(25);
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = __webpack_require__(7).EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(28);
/*</replacement>*/

var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(10);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(4);
util.inherits = __webpack_require__(0);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __webpack_require__(66);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __webpack_require__(57);
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || __webpack_require__(2);

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(13).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(2);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(13).StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;

var Duplex = __webpack_require__(2);

/*<replacement>*/
var util = __webpack_require__(4);
util.inherits = __webpack_require__(0);
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(7).EventEmitter;


/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = "<p data=\"14\">We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.</p> <h2 data=\"361\">Article. I.</h2> <h3 data=\"393\">Section. 1.</h3> <p data=\"424\">All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.</p> <h3 data=\"595\">Section. 2.</h3> <p data=\"626\">The House of Representatives shall be composed of Members chosen every second Year by the People of the several States, and the Electors in each State shall have the Qualifications requisite for Electors of the most numerous Branch of the State Legislature.</p> <p data=\"902\">No Person shall be a Representative who shall not have attained to the Age of twenty five Years, and been seven Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen.</p> <p data=\"1164\">Representatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons. The actual Enumeration shall be made within three Years after the first Meeting of the Congress of the United States, and within every subsequent Term of ten Years, in such Manner as they shall by Law direct. The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative; and until such enumeration shall be made, the State of New Hampshire shall be entitled to chuse three, Massachusetts eight, Rhode-Island and Providence Plantations one, Connecticut five, New-York six, New Jersey four, Pennsylvania eight, Delaware one, Maryland six, Virginia ten, North Carolina five, South Carolina five, and Georgia three.</p> <p data=\"2220\">When vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election to fill such Vacancies.</p> <p data=\"2385\">The House of Representatives shall chuse their Speaker and other Officers; and shall have the sole Power of Impeachment.</p> <h3 data=\"2526\">Section. 3.</h3> <p data=\"2558\">The Senate of the United States shall be composed of two Senators from each State, chosen by the Legislature thereof, for six Years; and each Senator shall have one Vote.</p> <p data=\"2748\">Immediately after they shall be assembled in Consequence of the first Election, they shall be divided as equally as may be into three Classes. The Seats of the Senators of the first Class shall be vacated at the Expiration of the second Year, of the second Class at the Expiration of the fourth Year, and of the third Class at the Expiration of the sixth Year, so that one third may be chosen every second Year; and if Vacancies happen by Resignation, or otherwise, during the Recess of the Legislature of any State, the Executive thereof may make temporary Appointments until the next Meeting of the Legislature, which shall then fill such Vacancies.</p> <p data=\"3419\">No Person shall be a Senator who shall not have attained to the Age of thirty Years, and been nine Years a Citizen of the United States, and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen.</p> <p data=\"3669\">The Vice President of the United States shall be President of the Senate, but shall have no Vote, unless they be equally divided.</p> <p data=\"3818\">The Senate shall chuse their other Officers, and also a President pro tempore, in the Absence of the Vice President, or when he shall exercise the Office of President of the United States.</p> <p data=\"4026\">The Senate shall have the sole Power to try all Impeachments. When sitting for that Purpose, they shall be on Oath or Affirmation. When the President of the United States is tried, the Chief Justice shall preside: And no Person shall be convicted without the Concurrence of two thirds of the Members present.</p> <p data=\"4354\">Judgment in Cases of Impeachment shall not extend further than to removal from Office, and disqualification to hold and enjoy any Office of honor, Trust or Profit under the United States: but the Party convicted shall nevertheless be liable and subject to Indictment, Trial, Judgment and Punishment, according to Law.</p> <h3 data=\"4692\">Section. 4.</h3> <p data=\"4724\">The Times, Places and Manner of holding Elections for Senators and Representatives, shall be prescribed in each State by the Legislature thereof; but the Congress may at any time by Law make or alter such Regulations, except as to the Places of chusing Senators.</p> <p data=\"5006\">The Congress shall assemble at least once in every Year, and such Meeting shall be on the first Monday in December, unless they shall by Law appoint a different Day.</p> <h3 data=\"5192\">Section. 5.</h3> <p data=\"5224\">Each House shall be the Judge of the Elections, Returns and Qualifications of its own Members, and a Majority of each shall constitute a Quorum to do Business; but a smaller Number may adjourn from day to day, and may be authorized to compel the Attendance of absent Members, in such Manner, and under such Penalties as each House may provide.</p> <p data=\"5587\">Each House may determine the Rules of its Proceedings, punish its Members for disorderly Behaviour, and, with the Concurrence of two thirds, expel a Member.</p> <p data=\"5763\">Each House shall keep a Journal of its Proceedings, and from time to time publish the same, excepting such Parts as may in their Judgment require Secrecy; and the Yeas and Nays of the Members of either House on any question shall, at the Desire of one fifth of those Present, be entered on the Journal.</p> <p data=\"6085\">Neither House, during the Session of Congress, shall, without the Consent of the other, adjourn for more than three days, nor to any other Place than that in which the two Houses shall be sitting.</p> <h3 data=\"6302\">Section. 6.</h3> <p data=\"6334\">The Senators and Representatives shall receive a Compensation for their Services, to be ascertained by Law, and paid out of the Treasury of the United States. They shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance at the Session of their respective Houses, and in going to and returning from the same; and for any Speech or Debate in either House, they shall not be questioned in any other Place.</p> <p data=\"6818\">No Senator or Representative shall, during the Time for which he was elected, be appointed to any civil Office under the Authority of the United States, which shall have been created, or the Emoluments whereof shall have been encreased during such time; and no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office.</p> <h3 data=\"7218\">Section. 7.</h3> <p data=\"7250\">All Bills for raising Revenue shall originate in the House of Representatives; but the Senate may propose or concur with Amendments as on other Bills.</p> <p data=\"7420\">Every Bill which shall have passed the House of Representatives and the Senate, shall, before it become a Law, be presented to the President of the United States; If he approve he shall sign it, but if not he shall return it, with his Objections to that House in which it shall have originated, who shall enter the Objections at large on their Journal, and proceed to reconsider it. If after such Reconsideration two thirds of that House shall agree to pass the Bill, it shall be sent, together with the Objections, to the other House, by which it shall likewise be reconsidered, and if approved by two thirds of that House, it shall become a Law. But in all such Cases the Votes of both Houses shall be determined by yeas and Nays, and the Names of the Persons voting for and against the Bill shall be entered on the Journal of each House respectively. If any Bill shall not be returned by the President within ten Days (Sundays excepted) after it shall have been presented to him, the Same shall be a Law, in like Manner as if he had signed it, unless the Congress by their Adjournment prevent its Return, in which Case it shall not be a Law.</p> <p data=\"8584\">Every Order, Resolution, or Vote to which the Concurrence of the Senate and House of Representatives may be necessary (except on a question of Adjournment) shall be presented to the President of the United States; and before the Same shall take Effect, shall be approved by him, or being disapproved by him, shall be repassed by two thirds of the Senate and House of Representatives, according to the Rules and Limitations prescribed in the Case of a Bill.</p> <h3 data=\"9061\">Section. 8.</h3> <p data=\"9093\">The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States; but all Duties, Imposts and Excises shall be uniform throughout the United States;</p> <p data=\"9374\">To borrow Money on the credit of the United States;</p> <p data=\"9445\">To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes;</p> <p data=\"9565\">To establish an uniform Rule of Naturalization, and uniform Laws on the subject of Bankruptcies throughout the United States;</p> <p data=\"9710\">To coin Money, regulate the Value thereof, and of foreign Coin, and fix the Standard of Weights and Measures;</p> <p data=\"9839\">To provide for the Punishment of counterfeiting the Securities and current Coin of the United States;</p> <p data=\"9960\">To establish Post Offices and post Roads;</p> <p data=\"10022\">To promote the Progress of Science and useful Arts, by securing for limited Times to Authors and Inventors the exclusive Right to their respective Writings and Discoveries;</p> <p data=\"10215\">To constitute Tribunals inferior to the supreme Court;</p> <p data=\"10290\">To define and punish Piracies and Felonies committed on the high Seas, and Offences against the Law of Nations;</p> <p data=\"10422\">To declare War, grant Letters of Marque and Reprisal, and make Rules concerning Captures on Land and Water;</p> <p data=\"10550\">To raise and support Armies, but no Appropriation of Money to that Use shall be for a longer Term than two Years;</p> <p data=\"10684\">To provide and maintain a Navy;</p> <p data=\"10736\">To make Rules for the Government and Regulation of the land and naval Forces;</p> <p data=\"10834\">To provide for calling forth the Militia to execute the Laws of the Union, suppress Insurrections and repel Invasions;</p> <p data=\"10973\">To provide for organizing, arming, and disciplining, the Militia, and for governing such Part of them as may be employed in the Service of the United States, reserving to the States respectively, the Appointment of the Officers, and the Authority of training the Militia according to the discipline prescribed by Congress;</p> <p data=\"11316\">To exercise exclusive Legislation in all Cases whatsoever, over such District (not exceeding ten Miles square) as may, by Cession of particular States, and the Acceptance of Congress, become the Seat of the Government of the United States, and to exercise like Authority over all Places purchased by the Consent of the Legislature of the State in which the Same shall be, for the Erection of Forts, Magazines, Arsenals, dock-Yards, and other needful Buildings;—And</p> <p data=\"11801\">To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers, and all other Powers vested by this Constitution in the Government of the United States, or in any Department or Officer thereof.</p> <h3 data=\"12055\">Section. 9.</h3> <p data=\"12088\">The Migration or Importation of such Persons as any of the States now existing shall think proper to admit, shall not be prohibited by the Congress prior to the Year one thousand eight hundred and eight, but a Tax or duty may be imposed on such Importation, not exceeding ten dollars for each Person.</p> <p data=\"12409\">The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion the public Safety may require it.</p> <p data=\"12576\">No Bill of Attainder or ex post facto Law shall be passed.</p> <p data=\"12655\">No Capitation, or other direct, Tax shall be laid, unless in Proportion to the Census or enumeration herein before directed to be taken.</p> <p data=\"12812\">No Tax or Duty shall be laid on Articles exported from any State.</p> <p data=\"12898\">No Preference shall be given by any Regulation of Commerce or Revenue to the Ports of one State over those of another: nor shall Vessels bound to, or from, one State, be obliged to enter, clear, or pay Duties in another.</p> <p data=\"13139\">No Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law; and a regular Statement and Account of the Receipts and Expenditures of all public Money shall be published from time to time.</p> <p data=\"13379\">No Title of Nobility shall be granted by the United States: And no Person holding any Office of Profit or Trust under them, shall, without the Consent of the Congress, accept of any present, Emolument, Office, or Title, of any kind whatever, from any King, Prince, or foreign State.</p> <h3 data=\"13683\">Section. 10.</h3> <p data=\"13717\">No State shall enter into any Treaty, Alliance, or Confederation; grant Letters of Marque and Reprisal; coin Money; emit Bills of Credit; make any Thing but gold and silver Coin a Tender in Payment of Debts; pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts, or grant any Title of Nobility.</p> <p data=\"14070\">No State shall, without the Consent of the Congress, lay any Imposts or Duties on Imports or Exports, except what may be absolutely necessary for executing it's inspection Laws: and the net Produce of all Duties and Imposts, laid by any State on Imports or Exports, shall be for the Use of the Treasury of the United States; and all such Laws shall be subject to the Revision and Controul of the Congress.</p> <p data=\"14496\">No State shall, without the Consent of Congress, lay any Duty of Tonnage, keep Troops, or Ships of War in time of Peace, enter into any Agreement or Compact with another State, or with a foreign Power, or engage in War, unless actually invaded, or in such imminent Danger as will not admit of delay.</p> <h2 data=\"14817\">Article. II.</h2> <h3 data=\"14852\">Section. 1.</h3> <p data=\"14885\">The executive Power shall be vested in a President of the United States of America. He shall hold his Office during the Term of four Years, and, together with the Vice President, chosen for the same Term, be elected, as follows</p> <p data=\"15133\">Each State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors, equal to the whole Number of Senators and Representatives to which the State may be entitled in the Congress: but no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector.</p> <p data=\"15502\">The Electors shall meet in their respective States, and vote by Ballot for two Persons, of whom one at least shall not be an Inhabitant of the same State with themselves. And they shall make a List of all the Persons voted for, and of the Number of Votes for each; which List they shall sign and certify, and transmit sealed to the Seat of the Government of the United States, directed to the President of the Senate. The President of the Senate shall, in the Presence of the Senate and House of Representatives, open all the Certificates, and the Votes shall then be counted. The Person having the greatest Number of Votes shall be the President, if such Number be a Majority of the whole Number of Electors appointed; and if there be more than one who have such Majority, and have an equal Number of Votes, then the House of Representatives shall immediately chuse by Ballot one of them for President; and if no Person have a Majority, then from the five highest on the List the said House shall in like Manner chuse the President. But in chusing the President, the Votes shall be taken by States, the Representation from each State having one Vote; A quorum for this Purpose shall consist of a Member or Members from two thirds of the States, and a Majority of all the States shall be necessary to a Choice. In every Case, after the Choice of the President, the Person having the greatest Number of Votes of the Electors shall be the Vice President. But if there should remain two or more who have equal Votes, the Senate shall chuse from them by Ballot the Vice President.</p> <p data=\"17099\">The Congress may determine the Time of chusing the Electors, and the Day on which they shall give their Votes; which Day shall be the same throughout the United States.</p> <p data=\"17288\">No Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President; neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years, and been fourteen Years a Resident within the United States.</p> <p data=\"17654\">In Case of the Removal of the President from Office, or of his Death, Resignation, or Inability to discharge the Powers and Duties of the said Office, the Same shall devolve on the Vice President, and the Congress may by Law provide for the Case of Removal, Death, Resignation or Inability, both of the President and Vice President, declaring what Officer shall then act as President, and such Officer shall act accordingly, until the Disability be removed, or a President shall be elected.</p> <p data=\"18165\">The President shall, at stated Times, receive for his Services, a Compensation, which shall neither be encreased nor diminished during the Period for which he shall have been elected, and he shall not receive within that Period any other Emolument from the United States, or any of them.</p> <p data=\"18473\">Before he enter on the Execution of his Office, he shall take the following Oath or Affirmation:—\"I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States.\"</p> <h3 data=\"18806\">Section. 2.</h3> <p data=\"18839\">The President shall be Commander in Chief of the Army and Navy of the United States, and of the Militia of the several States, when called into the actual Service of the United States; he may require the Opinion, in writing, of the principal Officer in each of the executive Departments, upon any Subject relating to the Duties of their respective Offices, and he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment.</p> <p data=\"19343\">He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties, provided two thirds of the Senators present concur; and he shall nominate, and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court, and all other Officers of the United States, whose Appointments are not herein otherwise provided for, and which shall be established by Law: but the Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments.</p> <p data=\"19991\">The President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate, by granting Commissions which shall expire at the End of their next Session.</p> <h3 data=\"20194\">Section. 3.</h3> <p data=\"20227\">He shall from time to time give to the Congress Information of the State of the Union, and recommend to their Consideration such Measures as he shall judge necessary and expedient; he may, on extraordinary Occasions, convene both Houses, or either of them, and in Case of Disagreement between them, with Respect to the Time of Adjournment, he may adjourn them to such Time as he shall think proper; he shall receive Ambassadors and other public Ministers; he shall take Care that the Laws be faithfully executed, and shall Commission all the Officers of the United States.</p> <h3 data=\"20821\">Section. 4.</h3> <p data=\"20854\">The President, Vice President and all civil Officers of the United States, shall be removed from Office on Impeachment for, and Conviction of, Treason, Bribery, or other high Crimes and Misdemeanors.</p> <h2 data=\"21075\">Article III.</h2> <h3 data=\"21110\">Section. 1.</h3> <p data=\"21143\">The judicial Power of the United States, shall be vested in one supreme Court, and in such inferior Courts as the Congress may from time to time ordain and establish. The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour, and shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office.</p> <h3 data=\"21570\">Section. 2.</h3> <p data=\"21603\">The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties made, or which shall be made, under their Authority;—to all Cases affecting Ambassadors, other public Ministers and Consuls;—to all Cases of admiralty and maritime Jurisdiction;—to Controversies to which the United States shall be a Party;—to Controversies between two or more States;— between a State and Citizens of another State,—between Citizens of different States,—between Citizens of the same State claiming Lands under Grants of different States, and between a State, or the Citizens thereof, and foreign States, Citizens or Subjects.</p> <p data=\"22308\">In all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction. In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact, with such Exceptions, and under such Regulations as the Congress shall make.</p> <p data=\"22691\">The Trial of all Crimes, except in Cases of Impeachment, shall be by Jury; and such Trial shall be held in the State where the said Crimes shall have been committed; but when not committed within any State, the Trial shall be at such Place or Places as the Congress may by Law have directed.</p> <h3 data=\"23004\">Section. 3.</h3> <p data=\"23037\">Treason against the United States, shall consist only in levying War against them, or in adhering to their Enemies, giving them Aid and Comfort. No Person shall be convicted of Treason unless on the Testimony of two Witnesses to the same overt Act, or on Confession in open Court.</p> <p data=\"23338\">The Congress shall have Power to declare the Punishment of Treason, but no Attainder of Treason shall work Corruption of Blood, or Forfeiture except during the Life of the Person attainted.</p> <h2 data=\"23549\">Article. IV.</h2> <h3 data=\"23584\">Section. 1.</h3> <p data=\"23617\">Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State. And the Congress may by general Laws prescribe the Manner in which such Acts, Records and Proceedings shall be proved, and the Effect thereof.</p> <h3 data=\"23908\">Section. 2.</h3> <p data=\"23941\">The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States.</p> <p data=\"24074\">A Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, and be found in another State, shall on Demand of the executive Authority of the State from which he fled, be delivered up, to be removed to the State having Jurisdiction of the Crime.</p> <p data=\"24376\">No Person held to Service or Labour in one State, under the Laws thereof, escaping into another, shall, in Consequence of any Law or Regulation therein, be discharged from such Service or Labour, but shall be delivered up on Claim of the Party to whom such Service or Labour may be due.</p> <h3 data=\"24684\">Section. 3.</h3> <p data=\"24717\">New States may be admitted by the Congress into this Union; but no new State shall be formed or erected within the Jurisdiction of any other State; nor any State be formed by the Junction of two or more States, or Parts of States, without the Consent of the Legislatures of the States concerned as well as of the Congress.</p> <p data=\"25060\">The Congress shall have Power to dispose of and make all needful Rules and Regulations respecting the Territory or other Property belonging to the United States; and nothing in this Constitution shall be so construed as to Prejudice any Claims of the United States, or of any particular State.</p> <h3 data=\"25375\">Section. 4.</h3> <p data=\"25408\">The United States shall guarantee to every State in this Union a Republican Form of Government, and shall protect each of them against Invasion; and on Application of the Legislature, or of the Executive (when the Legislature cannot be convened), against domestic Violence.</p> <h2 data=\"25703\">Article. V.</h2> <p data=\"25736\">The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution, or, on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments, which, in either Case, shall be valid to all Intents and Purposes, as Part of this Constitution, when ratified by the Legislatures of three fourths of the several States, or by Conventions in three fourths thereof, as the one or the other Mode of Ratification may be proposed by the Congress; Provided that no Amendment which may be made prior to the Year One thousand eight hundred and eight shall in any Manner affect the first and fourth Clauses in the Ninth Section of the first Article; and that no State, without its Consent, shall be deprived of its equal Suffrage in the Senate.</p> <h2 data=\"26595\">Article. VI.</h2> <p data=\"26629\">All Debts contracted and Engagements entered into, before the Adoption of this Constitution, shall be as valid against the United States under this Constitution, as under the Confederation.</p> <p data=\"26839\">This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding.</p> <p data=\"27219\">The Senators and Representatives before mentioned, and the Members of the several State Legislatures, and all executive and judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution; but no religious Test shall ever be required as a Qualification to any Office or public Trust under the United States.</p> <h2 data=\"27624\">Article. VII.</h2> <p data=\"27659\">The Ratification of the Conventions of nine States, shall be sufficient for the Establishment of this Constitution between the States so ratifying the Same.</p> <p data=\"27836\">The Word, \"the,\" being interlined between the seventh and eighth Lines of the first Page, The Word \"Thirty\" being partly written on an Erazure in the fifteenth Line of the first Page, The Words \"is tried\" being interlined between the thirty second and thirty third Lines of the first Page and the Word \"the\" being interlined between the forty third and forty fourth Lines of the second Page.</p> <p data=\"28248\">Attest William Jackson Secretary</p> <p data=\"28301\">done in Convention by the Unanimous Consent of the States present the Seventeenth Day of September in the Year of our Lord one thousand seven hundred and Eighty seven and of the Independance of the United States of America the Twelfth In witness whereof We have hereunto subscribed our Names,</p> <p data=\"28614\">G°. Washington</p> <p data=\"28649\">Presidt and deputy from Virginia</p> <h3 data=\"28703\">Delaware</h3> <p data=\"28733\">Geo: Read</p> <p data=\"28763\">Gunning Bedford jun</p> <p data=\"28803\">John Dickinson</p> <p data=\"28838\">Richard Bassett</p> <p data=\"28874\">Jaco: Broom</p> <h3 data=\"28907\">Maryland</h3> <p data=\"28937\">James McHenry</p> <p data=\"28971\">Dan of St Thos. Jenifer</p> <p data=\"29015\">Danl. Carroll</p> <h3 data=\"29050\">Virginia</h3> <p data=\"29080\">John Blair</p> <p data=\"29111\">James Madison Jr.</p> <h3 data=\"29150\">North Carolina</h3> <p data=\"29186\">Wm. Blount</p> <p data=\"29217\">Richd. Dobbs Spaight</p> <p data=\"29258\">Hu Williamson</p> <h3 data=\"29293\">South Carolina</h3> <p data=\"29329\">J. Rutledge</p> <p data=\"29361\">Charles Cotesworth Pinckney</p> <p data=\"29409\">Charles Pinckney</p> <p data=\"29446\">Pierce Butler</p> <h3 data=\"29481\">Georgia</h3> <p data=\"29510\">William Few</p> <p data=\"29542\">Abr Baldwin</p> <h3 data=\"29575\">New Hampshire</h3> <p data=\"29610\">John Langdon</p> <p data=\"29643\">Nicholas Gilman</p> <h3 data=\"29680\">Massachusetts</h3> <p data=\"29715\">Nathaniel Gorham</p> <p data=\"29752\">Rufus King</p> <h3 data=\"29784\">Connecticut</h3> <p data=\"29817\">Wm. Saml. Johnson</p> <p data=\"29855\">Roger Sherman</p> <h3 data=\"29890\">New York</h3> <p data=\"29920\">Alexander Hamilton</p> <h3 data=\"29960\">New Jersey</h3> <p data=\"29992\">Wil: Livingston</p> <p data=\"30028\">David Brearley</p> <p data=\"30063\">Wm. Paterson</p> <p data=\"30096\">Jona: Dayton</p> <h3 data=\"30130\">Pennsylvania</h3> <p data=\"30164\">B Franklin</p> <p data=\"30195\">Thomas Mifflin</p> <p data=\"30230\">Robt. Morris</p> <p data=\"30263\">Geo. Clymer</p> <p data=\"30295\">Thos. FitzSimons</p> <p data=\"30332\">Jared Ingersoll</p> <p data=\"30368\">James Wilson</p> <p data=\"30401\">Gouv Morris</p> ";

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var keycode = __webpack_require__(54);
var functions_1 = __webpack_require__(18);
/////////////////
// React model //
/////////////////
var Paragraph = (function (_super) {
    __extends(Paragraph, _super);
    function Paragraph(props) {
        var _this = _super.call(this, props) || this;
        _this.handleBlur = function () {
            // Paragraph is about to lose focus. If empty, should be removed.
            if (!_this.props.block.text) {
                _this.props.eventHandlers.handleDelete(_this.props.idx);
            }
        };
        _this.handleKeyDown = function (ev) {
            switch (ev.keyCode) {
                case keycode("enter"):
                    ev.preventDefault();
                    _this.props.eventHandlers.handleEnterPress();
                    break;
                case keycode("backspace") || keycode("delete"):
                    if (!_this.props.block.text) {
                        _this.props.eventHandlers.handleDelete(_this.props.idx);
                    }
                    break;
                default:
                    break;
            }
        };
        _this.handleChange = function (ev) {
            _this.props.onChange(_this.props.idx, ev.target.value);
        };
        _this.handleClick = function () {
            _this.props.eventHandlers.handleFocus(_this.props.idx);
        };
        _this.handleFocus = function () {
            _this.props.eventHandlers.handleFocus(_this.props.idx);
        };
        _this.handleKeyUp = function (ev) {
            _this.resetHeight();
        };
        _this.resetHeight = function () {
            var content = _this.props.block.text;
            content = content.replace(/\n/g, "<br />");
            _this.div.innerHTML = content + "<br />";
            var height = _this.div.clientHeight;
            _this.setState({
                style: { height: height }
            });
        };
        _this.state = {
            style: {}
        };
        return _this;
    }
    Paragraph.prototype.componentDidMount = function () {
        if (this.props.active) {
            this.textarea.focus();
        }
    };
    Paragraph.prototype.componentDidUpdate = function () {
        if (this.props.active) {
            this.textarea.focus();
        }
    };
    Paragraph.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.block.text !== nextProps.block.text) {
            this.resetHeight();
        }
    };
    Paragraph.prototype.render = function () {
        var _this = this;
        var classes = "editor__paragraph";
        if (this.props.active) {
            classes += " editor__paragraph--active";
        }
        return (React.createElement("div", null,
            React.createElement("textarea", { className: classes, onBlur: this.handleBlur, onChange: this.handleChange, onClick: this.handleClick, onFocus: this.handleFocus, onKeyDown: this.handleKeyDown, onKeyUp: this.handleKeyUp, placeholder: this.props.idx === 0 ? "Use your voice here." : "...", value: this.props.block.text, style: this.state.style, ref: function (textarea) { return (_this.textarea = textarea); } }),
            React.createElement("div", { className: "editor__paragraph-height-div", ref: function (div) { return (_this.div = div); } })));
    };
    return Paragraph;
}(React.Component));
var Document = (function (_super) {
    __extends(Document, _super);
    function Document(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClick = function () {
            _this.props.eventHandlers.handleFocus(_this.props.idx);
        };
        _this.handleFocus = function () {
            _this.props.eventHandlers.handleFocus(_this.props.idx);
        };
        _this.handleKeyDown = function (ev) {
            switch (ev.keyCode) {
                case keycode("enter"):
                    _this.props.eventHandlers.handleEnterPress();
                    break;
                case keycode("backspace") || keycode("delete"):
                    _this.props.eventHandlers.handleDelete(_this.props.idx);
                    break;
                default:
                    break;
            }
        };
        _this.state = {
            documentNodes: functions_1.getNodeArray(props.block.document)
        };
        return _this;
    }
    Document.prototype.render = function () {
        var props = this.props;
        var highlightedNodes = functions_1.getHighlightedNodes(this.state.documentNodes.slice(), props.block.range);
        var classes = "editor__document";
        if (this.props.active) {
            classes += " editor__document--active";
        }
        return (React.createElement("div", { tabIndex: 0, className: classes, onClick: this.handleClick, onFocus: this.handleFocus, onKeyDown: this.handleKeyDown }, highlightedNodes.map(function (node, index) {
            node.props["key"] = index.toString();
            return React.createElement(node.component, node.props, node.innerHTML);
        })));
    };
    return Document;
}(React.Component));
var BlockContainer = (function (_super) {
    __extends(BlockContainer, _super);
    function BlockContainer(props) {
        return _super.call(this, props) || this;
    }
    BlockContainer.prototype.render = function () {
        var inner;
        var props = this.props;
        var eventHandlers = {
            handleDelete: props.handleDelete,
            handleEnterPress: props.handleEnter,
            handleFocus: props.handleFocus
        };
        switch (props.block.kind) {
            case "paragraph":
                inner = (React.createElement(Paragraph, { block: props.block, idx: props.index, active: props.active, onChange: props.handleChange, eventHandlers: eventHandlers }));
                break;
            case "document":
                inner = (React.createElement(Document, { block: props.block, idx: props.index, active: props.active, eventHandlers: eventHandlers }));
                break;
        }
        return (React.createElement("div", { className: "editor__block" }, inner));
    };
    return BlockContainer;
}(React.Component));
var BlockEditor = (function (_super) {
    __extends(BlockEditor, _super);
    function BlockEditor(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (ev) {
            _this.props.handleChange(0, ev.target.value, true);
        };
        _this.handleKeyDown = function (ev) {
            if (ev.keyCode === keycode("enter")) {
                ev.preventDefault();
                _this.props.handleEnter(true);
            }
        };
        _this.handleKeyUp = function (ev) {
            var content = _this.props.takeDocument.title;
            content = content.replace(/\n/g, "<br />");
            _this.div.innerHTML = content + "<br />";
            _this.setState({
                style: { height: _this.div.clientHeight }
            });
        };
        _this.state = {
            style: {}
        };
        return _this;
    }
    BlockEditor.prototype.render = function () {
        var _this = this;
        var props = this.props;
        return (React.createElement("div", { className: "editor__wrapper" },
            React.createElement("div", { className: "editor" },
                React.createElement("div", { className: "editor__inner" },
                    React.createElement("textarea", { className: "editor__title", onChange: this.handleChange, onKeyDown: this.handleKeyDown, onKeyUp: this.handleKeyUp, placeholder: "Title", value: props.takeDocument.title, style: this.state.style }),
                    React.createElement("div", { className: "editor__title-height-div", ref: function (div) { return (_this.div = div); } }),
                    React.createElement("div", { className: "editor__block-list" }, props.takeDocument.blocks.map(function (block, idx) {
                        return React.createElement(BlockContainer, { key: idx.toString(), index: idx, block: Object.assign({}, block), handleDelete: props.handleDelete, handleChange: props.handleChange, handleFocus: props.handleFocus, handleEnter: props.handleEnter, active: idx === props.active });
                    }))))));
    };
    return BlockEditor;
}(React.Component));
exports.default = BlockEditor;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BlockEditor_1 = __webpack_require__(30);
exports.default = BlockEditor_1.default;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/*
  Module dependencies
*/
var ElementType = __webpack_require__(34);
var entities = __webpack_require__(44);

/*
  Boolean Attributes
*/
var booleanAttributes = {
  __proto__: null,
  allowfullscreen: true,
  async: true,
  autofocus: true,
  autoplay: true,
  checked: true,
  controls: true,
  default: true,
  defer: true,
  disabled: true,
  hidden: true,
  ismap: true,
  loop: true,
  multiple: true,
  muted: true,
  open: true,
  readonly: true,
  required: true,
  reversed: true,
  scoped: true,
  seamless: true,
  selected: true,
  typemustmatch: true
};

var unencodedElements = {
  __proto__: null,
  style: true,
  script: true,
  xmp: true,
  iframe: true,
  noembed: true,
  noframes: true,
  plaintext: true,
  noscript: true
};

/*
  Format attributes
*/
function formatAttrs(attributes, opts) {
  if (!attributes) return;

  var output = '',
      value;

  // Loop through the attributes
  for (var key in attributes) {
    value = attributes[key];
    if (output) {
      output += ' ';
    }

    if (!value && booleanAttributes[key]) {
      output += key;
    } else {
      output += key + '="' + (opts.decodeEntities ? entities.encodeXML(value) : value) + '"';
    }
  }

  return output;
}

/*
  Self-enclosing tags (stolen from node-htmlparser)
*/
var singleTag = {
  __proto__: null,
  area: true,
  base: true,
  basefont: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  isindex: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
};


var render = module.exports = function(dom, opts) {
  if (!Array.isArray(dom) && !dom.cheerio) dom = [dom];
  opts = opts || {};

  var output = '';

  for(var i = 0; i < dom.length; i++){
    var elem = dom[i];

    if (elem.type === 'root')
      output += render(elem.children, opts);
    else if (ElementType.isTag(elem))
      output += renderTag(elem, opts);
    else if (elem.type === ElementType.Directive)
      output += renderDirective(elem);
    else if (elem.type === ElementType.Comment)
      output += renderComment(elem);
    else if (elem.type === ElementType.CDATA)
      output += renderCdata(elem);
    else
      output += renderText(elem, opts);
  }

  return output;
};

function renderTag(elem, opts) {
  // Handle SVG
  if (elem.name === "svg") opts = {decodeEntities: opts.decodeEntities, xmlMode: true};

  var tag = '<' + elem.name,
      attribs = formatAttrs(elem.attribs, opts);

  if (attribs) {
    tag += ' ' + attribs;
  }

  if (
    opts.xmlMode
    && (!elem.children || elem.children.length === 0)
  ) {
    tag += '/>';
  } else {
    tag += '>';
    if (elem.children) {
      tag += render(elem.children, opts);
    }

    if (!singleTag[elem.name] || opts.xmlMode) {
      tag += '</' + elem.name + '>';
    }
  }

  return tag;
}

function renderDirective(elem) {
  return '<' + elem.data + '>';
}

function renderText(elem, opts) {
  var data = elem.data || '';

  // if entities weren't decoded, no need to encode them back
  if (opts.decodeEntities && !(elem.parent && elem.parent.name in unencodedElements)) {
    data = entities.encodeXML(data);
  }

  return data;
}

function renderCdata(elem) {
  return '<![CDATA[' + elem.children[0].data + ']]>';
}

function renderComment(elem) {
  return '<!--' + elem.data + '-->';
}


/***/ }),
/* 34 */
/***/ (function(module, exports) {

//Types of elements found in the DOM
module.exports = {
	Text: "text", //Text
	Directive: "directive", //<? ... ?>
	Comment: "comment", //<!-- ... -->
	Script: "script", //<script> tags
	Style: "style", //<style> tags
	Tag: "tag", //Any tag
	CDATA: "cdata", //<![CDATA[ ... ]]>

	isTag: function(elem){
		return elem.type === "tag" || elem.type === "script" || elem.type === "style";
	}
};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(5);

var re_whitespace = /\s+/g;
var NodePrototype = __webpack_require__(19);
var ElementPrototype = __webpack_require__(36);

function DomHandler(callback, options, elementCB){
	if(typeof callback === "object"){
		elementCB = options;
		options = callback;
		callback = null;
	} else if(typeof options === "function"){
		elementCB = options;
		options = defaultOpts;
	}
	this._callback = callback;
	this._options = options || defaultOpts;
	this._elementCB = elementCB;
	this.dom = [];
	this._done = false;
	this._tagStack = [];
	this._parser = this._parser || null;
}

//default options
var defaultOpts = {
	normalizeWhitespace: false, //Replace all whitespace with single spaces
	withStartIndices: false, //Add startIndex properties to nodes
	withEndIndices: false, //Add endIndex properties to nodes
};

DomHandler.prototype.onparserinit = function(parser){
	this._parser = parser;
};

//Resets the handler back to starting state
DomHandler.prototype.onreset = function(){
	DomHandler.call(this, this._callback, this._options, this._elementCB);
};

//Signals the handler that parsing is done
DomHandler.prototype.onend = function(){
	if(this._done) return;
	this._done = true;
	this._parser = null;
	this._handleCallback(null);
};

DomHandler.prototype._handleCallback =
DomHandler.prototype.onerror = function(error){
	if(typeof this._callback === "function"){
		this._callback(error, this.dom);
	} else {
		if(error) throw error;
	}
};

DomHandler.prototype.onclosetag = function(){
	//if(this._tagStack.pop().name !== name) this._handleCallback(Error("Tagname didn't match!"));
	
	var elem = this._tagStack.pop();

	if(this._options.withEndIndices){
		elem.endIndex = this._parser.endIndex;
	}

	if(this._elementCB) this._elementCB(elem);
};

DomHandler.prototype._createDomElement = function(properties){
	if (!this._options.withDomLvl1) return properties;

	var element;
	if (properties.type === "tag") {
		element = Object.create(ElementPrototype);
	} else {
		element = Object.create(NodePrototype);
	}

	for (var key in properties) {
		if (properties.hasOwnProperty(key)) {
			element[key] = properties[key];
		}
	}

	return element;
};

DomHandler.prototype._addDomElement = function(element){
	var parent = this._tagStack[this._tagStack.length - 1];
	var siblings = parent ? parent.children : this.dom;
	var previousSibling = siblings[siblings.length - 1];

	element.next = null;

	if(this._options.withStartIndices){
		element.startIndex = this._parser.startIndex;
	}
	if(this._options.withEndIndices){
		element.endIndex = this._parser.endIndex;
	}

	if(previousSibling){
		element.prev = previousSibling;
		previousSibling.next = element;
	} else {
		element.prev = null;
	}

	siblings.push(element);
	element.parent = parent || null;
};

DomHandler.prototype.onopentag = function(name, attribs){
	var properties = {
		type: name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag,
		name: name,
		attribs: attribs,
		children: []
	};

	var element = this._createDomElement(properties);

	this._addDomElement(element);

	this._tagStack.push(element);
};

DomHandler.prototype.ontext = function(data){
	//the ignoreWhitespace is officially dropped, but for now,
	//it's an alias for normalizeWhitespace
	var normalize = this._options.normalizeWhitespace || this._options.ignoreWhitespace;

	var lastTag;

	if(!this._tagStack.length && this.dom.length && (lastTag = this.dom[this.dom.length-1]).type === ElementType.Text){
		if(normalize){
			lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
		} else {
			lastTag.data += data;
		}
	} else {
		if(
			this._tagStack.length &&
			(lastTag = this._tagStack[this._tagStack.length - 1]) &&
			(lastTag = lastTag.children[lastTag.children.length - 1]) &&
			lastTag.type === ElementType.Text
		){
			if(normalize){
				lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
			} else {
				lastTag.data += data;
			}
		} else {
			if(normalize){
				data = data.replace(re_whitespace, " ");
			}

			var element = this._createDomElement({
				data: data,
				type: ElementType.Text
			});

			this._addDomElement(element);
		}
	}
};

DomHandler.prototype.oncomment = function(data){
	var lastTag = this._tagStack[this._tagStack.length - 1];

	if(lastTag && lastTag.type === ElementType.Comment){
		lastTag.data += data;
		return;
	}

	var properties = {
		data: data,
		type: ElementType.Comment
	};

	var element = this._createDomElement(properties);

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncdatastart = function(){
	var properties = {
		children: [{
			data: "",
			type: ElementType.Text
		}],
		type: ElementType.CDATA
	};

	var element = this._createDomElement(properties);

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncommentend = DomHandler.prototype.oncdataend = function(){
	this._tagStack.pop();
};

DomHandler.prototype.onprocessinginstruction = function(name, data){
	var element = this._createDomElement({
		name: name,
		data: data,
		type: ElementType.Directive
	});

	this._addDomElement(element);
};

module.exports = DomHandler;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

// DOM-Level-1-compliant structure
var NodePrototype = __webpack_require__(19);
var ElementPrototype = module.exports = Object.create(NodePrototype);

var domLvl1 = {
	tagName: "name"
};

Object.keys(domLvl1).forEach(function(key) {
	var shorthand = domLvl1[key];
	Object.defineProperty(ElementPrototype, key, {
		get: function() {
			return this[shorthand] || null;
		},
		set: function(val) {
			this[shorthand] = val;
			return val;
		}
	});
});


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var DomUtils = module.exports;

[
	__webpack_require__(42),
	__webpack_require__(43),
	__webpack_require__(40),
	__webpack_require__(41),
	__webpack_require__(39),
	__webpack_require__(38)
].forEach(function(ext){
	Object.keys(ext).forEach(function(key){
		DomUtils[key] = ext[key].bind(DomUtils);
	});
});


/***/ }),
/* 38 */
/***/ (function(module, exports) {

// removeSubsets
// Given an array of nodes, remove any member that is contained by another.
exports.removeSubsets = function(nodes) {
	var idx = nodes.length, node, ancestor, replace;

	// Check if each node (or one of its ancestors) is already contained in the
	// array.
	while (--idx > -1) {
		node = ancestor = nodes[idx];

		// Temporarily remove the node under consideration
		nodes[idx] = null;
		replace = true;

		while (ancestor) {
			if (nodes.indexOf(ancestor) > -1) {
				replace = false;
				nodes.splice(idx, 1);
				break;
			}
			ancestor = ancestor.parent;
		}

		// If the node has been found to be unique, re-insert it.
		if (replace) {
			nodes[idx] = node;
		}
	}

	return nodes;
};

// Source: http://dom.spec.whatwg.org/#dom-node-comparedocumentposition
var POSITION = {
	DISCONNECTED: 1,
	PRECEDING: 2,
	FOLLOWING: 4,
	CONTAINS: 8,
	CONTAINED_BY: 16
};

// Compare the position of one node against another node in any other document.
// The return value is a bitmask with the following values:
//
// document order:
// > There is an ordering, document order, defined on all the nodes in the
// > document corresponding to the order in which the first character of the
// > XML representation of each node occurs in the XML representation of the
// > document after expansion of general entities. Thus, the document element
// > node will be the first node. Element nodes occur before their children.
// > Thus, document order orders element nodes in order of the occurrence of
// > their start-tag in the XML (after expansion of entities). The attribute
// > nodes of an element occur after the element and before its children. The
// > relative order of attribute nodes is implementation-dependent./
// Source:
// http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
//
// @argument {Node} nodaA The first node to use in the comparison
// @argument {Node} nodeB The second node to use in the comparison
//
// @return {Number} A bitmask describing the input nodes' relative position.
//         See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
//         a description of these values.
var comparePos = exports.compareDocumentPosition = function(nodeA, nodeB) {
	var aParents = [];
	var bParents = [];
	var current, sharedParent, siblings, aSibling, bSibling, idx;

	if (nodeA === nodeB) {
		return 0;
	}

	current = nodeA;
	while (current) {
		aParents.unshift(current);
		current = current.parent;
	}
	current = nodeB;
	while (current) {
		bParents.unshift(current);
		current = current.parent;
	}

	idx = 0;
	while (aParents[idx] === bParents[idx]) {
		idx++;
	}

	if (idx === 0) {
		return POSITION.DISCONNECTED;
	}

	sharedParent = aParents[idx - 1];
	siblings = sharedParent.children;
	aSibling = aParents[idx];
	bSibling = bParents[idx];

	if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
		if (sharedParent === nodeB) {
			return POSITION.FOLLOWING | POSITION.CONTAINED_BY;
		}
		return POSITION.FOLLOWING;
	} else {
		if (sharedParent === nodeA) {
			return POSITION.PRECEDING | POSITION.CONTAINS;
		}
		return POSITION.PRECEDING;
	}
};

// Sort an array of nodes based on their relative position in the document and
// remove any duplicate nodes. If the array contains nodes that do not belong
// to the same document, sort order is unspecified.
//
// @argument {Array} nodes Array of DOM nodes
//
// @returns {Array} collection of unique nodes, sorted in document order
exports.uniqueSort = function(nodes) {
	var idx = nodes.length, node, position;

	nodes = nodes.slice();

	while (--idx > -1) {
		node = nodes[idx];
		position = nodes.indexOf(node);
		if (position > -1 && position < idx) {
			nodes.splice(idx, 1);
		}
	}
	nodes.sort(function(a, b) {
		var relative = comparePos(a, b);
		if (relative & POSITION.PRECEDING) {
			return -1;
		} else if (relative & POSITION.FOLLOWING) {
			return 1;
		}
		return 0;
	});

	return nodes;
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(5);
var isTag = exports.isTag = ElementType.isTag;

exports.testElement = function(options, element){
	for(var key in options){
		if(!options.hasOwnProperty(key));
		else if(key === "tag_name"){
			if(!isTag(element) || !options.tag_name(element.name)){
				return false;
			}
		} else if(key === "tag_type"){
			if(!options.tag_type(element.type)) return false;
		} else if(key === "tag_contains"){
			if(isTag(element) || !options.tag_contains(element.data)){
				return false;
			}
		} else if(!element.attribs || !options[key](element.attribs[key])){
			return false;
		}
	}
	return true;
};

var Checks = {
	tag_name: function(name){
		if(typeof name === "function"){
			return function(elem){ return isTag(elem) && name(elem.name); };
		} else if(name === "*"){
			return isTag;
		} else {
			return function(elem){ return isTag(elem) && elem.name === name; };
		}
	},
	tag_type: function(type){
		if(typeof type === "function"){
			return function(elem){ return type(elem.type); };
		} else {
			return function(elem){ return elem.type === type; };
		}
	},
	tag_contains: function(data){
		if(typeof data === "function"){
			return function(elem){ return !isTag(elem) && data(elem.data); };
		} else {
			return function(elem){ return !isTag(elem) && elem.data === data; };
		}
	}
};

function getAttribCheck(attrib, value){
	if(typeof value === "function"){
		return function(elem){ return elem.attribs && value(elem.attribs[attrib]); };
	} else {
		return function(elem){ return elem.attribs && elem.attribs[attrib] === value; };
	}
}

function combineFuncs(a, b){
	return function(elem){
		return a(elem) || b(elem);
	};
}

exports.getElements = function(options, element, recurse, limit){
	var funcs = Object.keys(options).map(function(key){
		var value = options[key];
		return key in Checks ? Checks[key](value) : getAttribCheck(key, value);
	});

	return funcs.length === 0 ? [] : this.filter(
		funcs.reduce(combineFuncs),
		element, recurse, limit
	);
};

exports.getElementById = function(id, element, recurse){
	if(!Array.isArray(element)) element = [element];
	return this.findOne(getAttribCheck("id", id), element, recurse !== false);
};

exports.getElementsByTagName = function(name, element, recurse, limit){
	return this.filter(Checks.tag_name(name), element, recurse, limit);
};

exports.getElementsByTagType = function(type, element, recurse, limit){
	return this.filter(Checks.tag_type(type), element, recurse, limit);
};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

exports.removeElement = function(elem){
	if(elem.prev) elem.prev.next = elem.next;
	if(elem.next) elem.next.prev = elem.prev;

	if(elem.parent){
		var childs = elem.parent.children;
		childs.splice(childs.lastIndexOf(elem), 1);
	}
};

exports.replaceElement = function(elem, replacement){
	var prev = replacement.prev = elem.prev;
	if(prev){
		prev.next = replacement;
	}

	var next = replacement.next = elem.next;
	if(next){
		next.prev = replacement;
	}

	var parent = replacement.parent = elem.parent;
	if(parent){
		var childs = parent.children;
		childs[childs.lastIndexOf(elem)] = replacement;
	}
};

exports.appendChild = function(elem, child){
	child.parent = elem;

	if(elem.children.push(child) !== 1){
		var sibling = elem.children[elem.children.length - 2];
		sibling.next = child;
		child.prev = sibling;
		child.next = null;
	}
};

exports.append = function(elem, next){
	var parent = elem.parent,
		currNext = elem.next;

	next.next = currNext;
	next.prev = elem;
	elem.next = next;
	next.parent = parent;

	if(currNext){
		currNext.prev = next;
		if(parent){
			var childs = parent.children;
			childs.splice(childs.lastIndexOf(currNext), 0, next);
		}
	} else if(parent){
		parent.children.push(next);
	}
};

exports.prepend = function(elem, prev){
	var parent = elem.parent;
	if(parent){
		var childs = parent.children;
		childs.splice(childs.lastIndexOf(elem), 0, prev);
	}

	if(elem.prev){
		elem.prev.next = prev;
	}
	
	prev.parent = parent;
	prev.prev = elem.prev;
	prev.next = elem;
	elem.prev = prev;
};




/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var isTag = __webpack_require__(5).isTag;

module.exports = {
	filter: filter,
	find: find,
	findOneChild: findOneChild,
	findOne: findOne,
	existsOne: existsOne,
	findAll: findAll
};

function filter(test, element, recurse, limit){
	if(!Array.isArray(element)) element = [element];

	if(typeof limit !== "number" || !isFinite(limit)){
		limit = Infinity;
	}
	return find(test, element, recurse !== false, limit);
}

function find(test, elems, recurse, limit){
	var result = [], childs;

	for(var i = 0, j = elems.length; i < j; i++){
		if(test(elems[i])){
			result.push(elems[i]);
			if(--limit <= 0) break;
		}

		childs = elems[i].children;
		if(recurse && childs && childs.length > 0){
			childs = find(test, childs, recurse, limit);
			result = result.concat(childs);
			limit -= childs.length;
			if(limit <= 0) break;
		}
	}

	return result;
}

function findOneChild(test, elems){
	for(var i = 0, l = elems.length; i < l; i++){
		if(test(elems[i])) return elems[i];
	}

	return null;
}

function findOne(test, elems){
	var elem = null;

	for(var i = 0, l = elems.length; i < l && !elem; i++){
		if(!isTag(elems[i])){
			continue;
		} else if(test(elems[i])){
			elem = elems[i];
		} else if(elems[i].children.length > 0){
			elem = findOne(test, elems[i].children);
		}
	}

	return elem;
}

function existsOne(test, elems){
	for(var i = 0, l = elems.length; i < l; i++){
		if(
			isTag(elems[i]) && (
				test(elems[i]) || (
					elems[i].children.length > 0 &&
					existsOne(test, elems[i].children)
				)
			)
		){
			return true;
		}
	}

	return false;
}

function findAll(test, elems){
	var result = [];
	for(var i = 0, j = elems.length; i < j; i++){
		if(!isTag(elems[i])) continue;
		if(test(elems[i])) result.push(elems[i]);

		if(elems[i].children.length > 0){
			result = result.concat(findAll(test, elems[i].children));
		}
	}
	return result;
}


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(5),
    getOuterHTML = __webpack_require__(33),
    isTag = ElementType.isTag;

module.exports = {
	getInnerHTML: getInnerHTML,
	getOuterHTML: getOuterHTML,
	getText: getText
};

function getInnerHTML(elem, opts){
	return elem.children ? elem.children.map(function(elem){
		return getOuterHTML(elem, opts);
	}).join("") : "";
}

function getText(elem){
	if(Array.isArray(elem)) return elem.map(getText).join("");
	if(isTag(elem) || elem.type === ElementType.CDATA) return getText(elem.children);
	if(elem.type === ElementType.Text) return elem.data;
	return "";
}


/***/ }),
/* 43 */
/***/ (function(module, exports) {

var getChildren = exports.getChildren = function(elem){
	return elem.children;
};

var getParent = exports.getParent = function(elem){
	return elem.parent;
};

exports.getSiblings = function(elem){
	var parent = getParent(elem);
	return parent ? getChildren(parent) : [elem];
};

exports.getAttributeValue = function(elem, name){
	return elem.attribs && elem.attribs[name];
};

exports.hasAttrib = function(elem, name){
	return !!elem.attribs && hasOwnProperty.call(elem.attribs, name);
};

exports.getName = function(elem){
	return elem.name;
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var encode = __webpack_require__(46),
    decode = __webpack_require__(45);

exports.decode = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTML)(data);
};

exports.decodeStrict = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTMLStrict)(data);
};

exports.encode = function(data, level){
	return (!level || level <= 0 ? encode.XML : encode.HTML)(data);
};

exports.encodeXML = encode.XML;

exports.encodeHTML4 =
exports.encodeHTML5 =
exports.encodeHTML  = encode.HTML;

exports.decodeXML =
exports.decodeXMLStrict = decode.XML;

exports.decodeHTML4 =
exports.decodeHTML5 =
exports.decodeHTML = decode.HTML;

exports.decodeHTML4Strict =
exports.decodeHTML5Strict =
exports.decodeHTMLStrict = decode.HTMLStrict;

exports.escape = encode.escape;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var entityMap = __webpack_require__(11),
    legacyMap = __webpack_require__(21),
    xmlMap    = __webpack_require__(12),
    decodeCodePoint = __webpack_require__(20);

var decodeXMLStrict  = getStrictDecoder(xmlMap),
    decodeHTMLStrict = getStrictDecoder(entityMap);

function getStrictDecoder(map){
	var keys = Object.keys(map).join("|"),
	    replace = getReplacer(map);

	keys += "|#[xX][\\da-fA-F]+|#\\d+";

	var re = new RegExp("&(?:" + keys + ");", "g");

	return function(str){
		return String(str).replace(re, replace);
	};
}

var decodeHTML = (function(){
	var legacy = Object.keys(legacyMap)
		.sort(sorter);

	var keys = Object.keys(entityMap)
		.sort(sorter);

	for(var i = 0, j = 0; i < keys.length; i++){
		if(legacy[j] === keys[i]){
			keys[i] += ";?";
			j++;
		} else {
			keys[i] += ";";
		}
	}

	var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"),
	    replace = getReplacer(entityMap);

	function replacer(str){
		if(str.substr(-1) !== ";") str += ";";
		return replace(str);
	}

	//TODO consider creating a merged map
	return function(str){
		return String(str).replace(re, replacer);
	};
}());

function sorter(a, b){
	return a < b ? 1 : -1;
}

function getReplacer(map){
	return function replace(str){
		if(str.charAt(1) === "#"){
			if(str.charAt(2) === "X" || str.charAt(2) === "x"){
				return decodeCodePoint(parseInt(str.substr(3), 16));
			}
			return decodeCodePoint(parseInt(str.substr(2), 10));
		}
		return map[str.slice(1, -1)];
	};
}

module.exports = {
	XML: decodeXMLStrict,
	HTML: decodeHTML,
	HTMLStrict: decodeHTMLStrict
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var inverseXML = getInverseObj(__webpack_require__(12)),
    xmlReplacer = getInverseReplacer(inverseXML);

exports.XML = getInverse(inverseXML, xmlReplacer);

var inverseHTML = getInverseObj(__webpack_require__(11)),
    htmlReplacer = getInverseReplacer(inverseHTML);

exports.HTML = getInverse(inverseHTML, htmlReplacer);

function getInverseObj(obj){
	return Object.keys(obj).sort().reduce(function(inverse, name){
		inverse[obj[name]] = "&" + name + ";";
		return inverse;
	}, {});
}

function getInverseReplacer(inverse){
	var single = [],
	    multiple = [];

	Object.keys(inverse).forEach(function(k){
		if(k.length === 1){
			single.push("\\" + k);
		} else {
			multiple.push(k);
		}
	});

	//TODO add ranges
	multiple.unshift("[" + single.join("") + "]");

	return new RegExp(multiple.join("|"), "g");
}

var re_nonASCII = /[^\0-\x7F]/g,
    re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function singleCharReplacer(c){
	return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
}

function astralReplacer(c){
	// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	var high = c.charCodeAt(0);
	var low  = c.charCodeAt(1);
	var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
	return "&#x" + codePoint.toString(16).toUpperCase() + ";";
}

function getInverse(inverse, re){
	function func(name){
		return inverse[name];
	}

	return function(data){
		return data
				.replace(re, func)
				.replace(re_astralSymbols, astralReplacer)
				.replace(re_nonASCII, singleCharReplacer);
	};
}

var re_xmlChars = getInverseReplacer(inverseXML);

function escapeXML(data){
	return data
			.replace(re_xmlChars, singleCharReplacer)
			.replace(re_astralSymbols, astralReplacer)
			.replace(re_nonASCII, singleCharReplacer);
}

exports.escape = escapeXML;


/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = {
	"0": 65533,
	"128": 8364,
	"130": 8218,
	"131": 402,
	"132": 8222,
	"133": 8230,
	"134": 8224,
	"135": 8225,
	"136": 710,
	"137": 8240,
	"138": 352,
	"139": 8249,
	"140": 338,
	"142": 381,
	"145": 8216,
	"146": 8217,
	"147": 8220,
	"148": 8221,
	"149": 8226,
	"150": 8211,
	"151": 8212,
	"152": 732,
	"153": 8482,
	"154": 353,
	"155": 8250,
	"156": 339,
	"158": 382,
	"159": 376
};

/***/ }),
/* 48 */
/***/ (function(module, exports) {

module.exports = "<h2 data=\"15\">Amendment 1</h2> <p data=\"45\">Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.</p>  <h2 data=\"338\">Amendment 2</h2> <p data=\"369\">A well regulated Militia, being necessary to the security of a free State, the right of the people to keep and bear Arms, shall not be infringed.</p>  <h2 data=\"535\">Amendment 3</h2> <p data=\"566\">No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.</p>  <h2 data=\"743\">Amendment 4</h2> <p data=\"774\">The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.</p>  <h2 data=\"1128\">Amendment 5</h2> <p data=\"1160\">No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury, except in cases arising in the land or naval forces, or in the Militia, when in actual service in time of War or public danger; nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb; nor shall be compelled in any criminal case to be a witness against himself, nor be deprived of life, liberty, or property, without due process of law; nor shall private property be taken for public use, without just compensation.</p>  <h2 data=\"1771\">Amendment 6</h2> <p data=\"1803\">In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury of the State and district wherein the crime shall have been committed, which district shall have been previously ascertained by law, and to be informed of the nature and cause of the accusation; to be confronted with the witnesses against him; to have compulsory process for obtaining witnesses in his favor, and to have the Assistance of Counsel for his defence.</p>  <h2 data=\"2303\">Amendment 7</h2> <p data=\"2335\">In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved, and no fact tried by a jury, shall be otherwise re-examined in any Court of the United States, than according to the rules of the common law.</p>  <h2 data=\"2629\">Amendment 8</h2> <p data=\"2661\">Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted.</p>  <h2 data=\"2794\">Amendment 9</h2> <p data=\"2826\">The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people.</p>  <h2 data=\"2978\">Amendment 10</h2> <p data=\"3011\">The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.</p>  <h2 data=\"3194\">Amendment 11</h2> <p data=\"3227\">The Judicial power of the United States shall not be construed to extend to any suit in law or equity, commenced or prosecuted against one of the United States by Citizens of another State, or by Citizens or Subjects of any Foreign State.</p>  <h2 data=\"3487\">Amendment 12</h2> <p data=\"3520\">The Electors shall meet in their respective states and vote by ballot for President and Vice-President, one of whom, at least, shall not be an inhabitant of the same state with themselves; they shall name in their ballots the person voted for as President, and in distinct ballots the person voted for as Vice- President, and they shall make distinct lists of all persons voted for as President, and of all persons voted for as Vice-President, and of the number of votes for each, which lists they shall sign and certify, and transmit sealed to the seat of the government of the United States, directed to the President of the Senate;--The President of the Senate shall, in the presence of the Senate and House of Representatives, open all the certificates and the votes shall then be counted;--The person having the greatest Number of votes for President, shall be the President, if such number be a majority of the whole number of Electors appointed; and if no person have such majority, then from the persons having the highest numbers not exceeding three on the list of those voted for as President, the House of Representatives shall choose immediately, by ballot, the President. But in choosing the President, the votes shall be taken by states, the representation from each state having one vote; a quorum for this purpose shall consist of a member or members from two-thirds of the states, and a majority of all the states shall be necessary to a choice. And if the House of Representatives shall not choose a President whenever the right of choice shall devolve upon them, before the fourth day of March next following, then the Vice- President shall act as President, as in the case of the death or other constitutional disability of the President--The person having the greatest number of votes as Vice-President, shall be the Vice-President, if such number be a majority of the whole number of Electors appointed, and if no person have a majority, then from the two highest numbers on the list, the Senate shall choose the Vice-President; a quorum for the purpose shall consist of two-thirds of the whole number of Senators, and a majority of the whole number shall be necessary to a choice. But no person constitutionally ineligible to the office of President shall be eligible to that of Vice-President of the United States.</p>  <h2 data=\"5880\">Amendment 13</h2> <p data=\"5913\">Section 1. Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction.</p>  <p data=\"6152\">Section 2. Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"6262\">Amendment 14</h2> <p data=\"6295\">Section. 1. All persons born or naturalized in the United States and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.</p>  <p data=\"6794\">Section. 2. Representatives shall be apportioned among the several States according to their respective numbers, counting the whole number of persons in each State, excluding Indians not taxed. But when the right to vote at any election for the choice of electors for President and Vice President of the United States, Representatives in Congress, the Executive and Judicial officers of a State, or the members of the Legislature thereof, is denied to any of the male inhabitants of such State, being twenty-one years of age, and citizens of the United States, or in any way abridged, except for participation in rebellion, or other crime, the basis of representation therein shall be reduced in the proportion which the number of such male citizens shall bear to the whole number of male citizens twenty-one years of age in such State.</p>  <p data=\"7651\">Section. 3. No person shall be a Senator or Representative in Congress, or elector of President and Vice President, or hold any office, civil or military, under the United States, or under any State, who, having previously taken an oath, as a member of Congress, or as an officer of the United States, or as a member of any State legislature, or as an executive or judicial officer of any State, to support the Constitution of the United States, shall have engaged in insurrection or rebellion against the same, or given aid or comfort to the enemies thereof. But Congress may by a vote of two-thirds of each House, remove such disability.</p>  <p data=\"8311\">Section. 4. The validity of the public debt of the United States, authorized by law, including debts incurred for payment of pensions and bounties for services in suppressing insurrection or rebellion, shall not be questioned. But neither the United States nor any State shall assume or pay any debt or obligation incurred in aid of insurrection or rebellion against the United States, or any claim for the loss or emancipation of any slave; but all such debts, obligations and claims shall be held illegal and void.</p>  <p data=\"8848\">Section. 5. The Congress shall have power to enforce, by appropriate legislation, the provisions of this article.</p>  <h2 data=\"8983\">Amendment 15</h2> <p data=\"9016\">Section. 1. The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude.</p>  <p data=\"9231\">Section. 2. The Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"9346\">Amendment 16</h2> <p data=\"9379\">The Congress shall have power to lay and collect taxes on incomes, from whatever source derived, without apportionment among the several States, and without regard to any census or enumeration.</p>  <h2 data=\"9594\">Amendment 17</h2> <p data=\"9627\">The Senate of the United States shall be composed of two Senators from each State, elected by the people thereof, for six years; and each Senator shall have one vote. The electors in each State shall have the qualifications requisite for electors of the most numerous branch of the State legislatures.</p>  <p data=\"9949\">When vacancies happen in the representation of any State in the Senate, the executive authority of such State shall issue writs of election to fill such vacancies: Provided, That the legislature of any State may empower the executive thereof to make temporary appointments until the people fill the vacancies by election as the legislature may direct.</p>  <p data=\"10322\">This amendment shall not be so construed as to affect the election or term of any Senator chosen before it becomes valid as part of the Constitution.</p>  <h2 data=\"10494\">Amendment 18</h2> <p data=\"10528\">Section. 1. After one year from the ratification of this article the manufacture, sale, or transportation of intoxicating liquors within, the importation thereof into, or the exportation thereof from the United States and all territory subject to the jurisdiction thereof for beverage purposes is hereby prohibited.</p>  <p data=\"10865\">Sec. 2. The Congress and the several States shall have concurrent power to enforce this article by appropriate legislation.</p>  <p data=\"11010\">Sec. 3. This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of the several States, as provided in the Constitution, within seven years from the date of the submission hereof to the States by the Congress.</p>  <h2 data=\"11310\">Amendment 19</h2>> <p data=\"11345\">The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex. Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"11584\">Amendment 20</h2> <p data=\"11618\">Section. 1. The terms of the President and Vice President shall end at noon on the 20th day of January, and the terms of Senators and Representatives at noon on the 3d day of January, of the years in which such terms would have ended if this article had not been ratified; and the terms of their successors shall then begin.</p>  <p data=\"11964\">Sec. 2. The Congress shall assemble at least once in every year, and such meeting shall begin at noon on the 3d day of January, unless they shall by law appoint a different day.</p>  <p data=\"12163\">Sec. 3. If, at the time fixed for the beginning of the term of the President, the President elect shall have died, the Vice President elect shall become President. If a President shall not have been chosen before the time fixed for the beginning of his term, or if the President elect shall have failed to qualify, then the Vice President elect shall act as President until a President shall have qualified; and the Congress may by law provide for the case wherein neither a President elect nor a Vice President elect shall have qualified, declaring who shall then act as President, or the manner in which one who is to act shall be selected, and such person shall act accordingly until a President or Vice President shall have qualified.</p>  <p data=\"12923\">Sec. 4. The Congress may by law provide for the case of the death of any of the persons from whom the House of Representatives may choose a President whenever the right of choice shall have devolved upon them, and for the case of the death of any of the persons from whom the Senate may choose a Vice President whenever the right of choice shall have devolved upon them.</p>  <p data=\"13315\">Sec. 5. Sections 1 and 2 shall take effect on the 15th day of October following the ratification of this article.</p>  <p data=\"13450\">Sec. 6. This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of three-fourths of the several States within seven years from the date of its submission.</p>  <h2 data=\"13696\">Amendment 21</h2> <p data=\"13730\">Section. 1. The eighteenth article of amendment to the Constitution of the United States is hereby repealed.</p>  <p data=\"13860\">Sec. 2. The transportation or importation into any State, Territory, or possession of the United States for delivery or use therein of intoxicating liquors, in violation of the laws thereof, is hereby prohibited.</p>  <p data=\"14094\">Sec. 3. This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by conventions in the several States, as provided in the Constitution, within seven years from the date of the submission hereof to the States by the Congress.</p>  <h2 data=\"14389\">Amendment 22</h2> <p data=\"14423\">Section. 1. No person shall be elected to the office of the President more than twice, and no person who has held the office of President, or acted as President, for more than two years of a term to which some other person was elected President shall be elected to the office of the President more than once. But this Article shall not apply to any person holding the office of President, when this Article was proposed by the Congress, and shall not prevent any person who may be holding the office of President, or acting as President, during the term within which this Article becomes operative from holding the office of President or acting as President during the remainder of such term.</p>  <p data=\"15137\">Sec. 2. This article shall be inoperative unless it shall have been ratified as an amendment to the Constitution by the legislatures of three-fourths of the several States within seven years from the date of its submission to the States by the Congress.</p>  <h2 data=\"15413\">Amendment 23</h2> <p data=\"15447\">Section. 1. The District constituting the seat of Government of the United States shall appoint in such manner as the Congress may direct: A number of electors of President and Vice President equal to the whole number of Senators and Representatives in Congress to which the District would be entitled if it were a State, but in no event more than the least populous State; they shall be in addition to those appointed by the States, but they shall be considered, for the purposes of the election of President and Vice President, to be electors appointed by a State; and they shall meet in the District and perform such duties as provided by the twelfth article of amendment.</p>  <p data=\"16144\">Sec. 2. The Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"16256\">Amendment 24</h2> <p data=\"16290\">Section. 1. The right of citizens of the United States to vote in any primary or other election for President or Vice President, for electors for President or Vice President, or for Senator or Representative in Congress, shall not be denied or abridged by the United States or any State by reason of failure to pay any poll tax or other tax.</p>  <p data=\"16653\">Section. 2. The Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"16769\">Amendment 25</h2> <p data=\"16803\">Section. 1. In case of the removal of the President from office or of his death or resignation, the Vice President shall become President.</p>  <p data=\"16963\">Section. 2. Whenever there is a vacancy in the office of the Vice President, the President shall nominate a Vice President who shall take office upon confirmation by a majority vote of both Houses of Congress.</p>  <p data=\"17194\">Section. 3. Whenever the President transmits to the President pro tempore of the Senate and the Speaker of the House of Representatives has written declaration that he is unable to discharge the powers and duties of his office, and until he transmits to them a written declaration to the contrary, such powers and duties shall be discharged by the Vice President as Acting President.</p>  <p data=\"17599\">Section. 4. Whenever the Vice President and a majority of either the principal officers of the executive departments or of such other body as Congress may by law provide, transmit to the President pro tempore of the Senate and the Speaker of the House of Representatives their written declaration that the President is unable to discharge the powers and duties of his office, the Vice President shall immediately assume the powers and duties of the office as Acting President.</p>  <p data=\"18097\">Thereafter, when the President transmits to the President pro tempore of the Senate and the Speaker of the House of Representatives has written declaration that no inability exists, he shall resume the powers and duties of his office unless the Vice President and a majority of either the principal officers of the executive department or of such other body as Congress may by law provide, transmit within four days to the President pro tempore of the Senate and the Speaker of the House of Representatives their written declaration that the President is unable to discharge the powers and duties of his office. Thereupon Congress shall decide the issue, assembling within forty-eight hours for that purpose if not in session. If the Congress, within twenty-one days after receipt of the latter written declaration, or, if Congress is not in session, within twenty-one days after Congress is required to assemble, determines by two-thirds vote of both Houses that the President is unable to discharge the powers and duties of his office, the Vice President shall continue to discharge the same as Acting President; otherwise, the President shall resume the powers and duties of his office.</p>  <h2 data=\"19309\">Amendment 26</h2> <p data=\"19343\">Section. 1. The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age.</p>  <p data=\"19556\">Section. 2. The Congress shall have power to enforce this article by appropriate legislation.</p>  <h2 data=\"19672\">Amendment 27</h2> <p data=\"19706\">No law varying the compensation for the services of the Senators and Representatives shall take effect, until an election of Representatives shall have intervened.</p> ";

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = CollectingHandler;

function CollectingHandler(cbs){
	this._cbs = cbs || {};
	this.events = [];
}

var EVENTS = __webpack_require__(6).EVENTS;
Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(){
			this.events.push([name]);
			if(this._cbs[name]) this._cbs[name]();
		};
	} else if(EVENTS[name] === 1){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(a){
			this.events.push([name, a]);
			if(this._cbs[name]) this._cbs[name](a);
		};
	} else if(EVENTS[name] === 2){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(a, b){
			this.events.push([name, a, b]);
			if(this._cbs[name]) this._cbs[name](a, b);
		};
	} else {
		throw Error("wrong number of arguments");
	}
});

CollectingHandler.prototype.onreset = function(){
	this.events = [];
	if(this._cbs.onreset) this._cbs.onreset();
};

CollectingHandler.prototype.restart = function(){
	if(this._cbs.onreset) this._cbs.onreset();

	for(var i = 0, len = this.events.length; i < len; i++){
		if(this._cbs[this.events[i][0]]){

			var num = this.events[i].length;

			if(num === 1){
				this._cbs[this.events[i][0]]();
			} else if(num === 2){
				this._cbs[this.events[i][0]](this.events[i][1]);
			} else {
				this._cbs[this.events[i][0]](this.events[i][1], this.events[i][2]);
			}
		}
	}
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var index = __webpack_require__(6),
    DomHandler = index.DomHandler,
    DomUtils = index.DomUtils;

//TODO: make this a streamable handler
function FeedHandler(callback, options){
	this.init(callback, options);
}

__webpack_require__(0)(FeedHandler, DomHandler);

FeedHandler.prototype.init = DomHandler;

function getElements(what, where){
	return DomUtils.getElementsByTagName(what, where, true);
}
function getOneElement(what, where){
	return DomUtils.getElementsByTagName(what, where, true, 1)[0];
}
function fetch(what, where, recurse){
	return DomUtils.getText(
		DomUtils.getElementsByTagName(what, where, recurse, 1)
	).trim();
}

function addConditionally(obj, prop, what, where, recurse){
	var tmp = fetch(what, where, recurse);
	if(tmp) obj[prop] = tmp;
}

var isValidFeed = function(value){
	return value === "rss" || value === "feed" || value === "rdf:RDF";
};

FeedHandler.prototype.onend = function(){
	var feed = {},
	    feedRoot = getOneElement(isValidFeed, this.dom),
	    tmp, childs;

	if(feedRoot){
		if(feedRoot.name === "feed"){
			childs = feedRoot.children;

			feed.type = "atom";
			addConditionally(feed, "id", "id", childs);
			addConditionally(feed, "title", "title", childs);
			if((tmp = getOneElement("link", childs)) && (tmp = tmp.attribs) && (tmp = tmp.href)) feed.link = tmp;
			addConditionally(feed, "description", "subtitle", childs);
			if((tmp = fetch("updated", childs))) feed.updated = new Date(tmp);
			addConditionally(feed, "author", "email", childs, true);

			feed.items = getElements("entry", childs).map(function(item){
				var entry = {}, tmp;

				item = item.children;

				addConditionally(entry, "id", "id", item);
				addConditionally(entry, "title", "title", item);
				if((tmp = getOneElement("link", item)) && (tmp = tmp.attribs) && (tmp = tmp.href)) entry.link = tmp;
				if((tmp = fetch("summary", item) || fetch("content", item))) entry.description = tmp;
				if((tmp = fetch("updated", item))) entry.pubDate = new Date(tmp);
				return entry;
			});
		} else {
			childs = getOneElement("channel", feedRoot.children).children;

			feed.type = feedRoot.name.substr(0, 3);
			feed.id = "";
			addConditionally(feed, "title", "title", childs);
			addConditionally(feed, "link", "link", childs);
			addConditionally(feed, "description", "description", childs);
			if((tmp = fetch("lastBuildDate", childs))) feed.updated = new Date(tmp);
			addConditionally(feed, "author", "managingEditor", childs, true);

			feed.items = getElements("item", feedRoot.children).map(function(item){
				var entry = {}, tmp;

				item = item.children;

				addConditionally(entry, "id", "guid", item);
				addConditionally(entry, "title", "title", item);
				addConditionally(entry, "link", "link", item);
				addConditionally(entry, "description", "description", item);
				if((tmp = fetch("pubDate", item))) entry.pubDate = new Date(tmp);
				return entry;
			});
		}
	}
	this.dom = feed;
	DomHandler.prototype._handleCallback.call(
		this, feedRoot ? null : Error("couldn't find root of feed")
	);
};

module.exports = FeedHandler;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = ProxyHandler;

function ProxyHandler(cbs){
	this._cbs = cbs || {};
}

var EVENTS = __webpack_require__(6).EVENTS;
Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(){
			if(this._cbs[name]) this._cbs[name]();
		};
	} else if(EVENTS[name] === 1){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(a){
			if(this._cbs[name]) this._cbs[name](a);
		};
	} else if(EVENTS[name] === 2){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(a, b){
			if(this._cbs[name]) this._cbs[name](a, b);
		};
	} else {
		throw Error("wrong number of arguments");
	}
});

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = Stream;

var Parser = __webpack_require__(24);

function Stream(options){
	Parser.call(this, new Cbs(this), options);
}

__webpack_require__(0)(Stream, Parser);

Stream.prototype.readable = true;

function Cbs(scope){
	this.scope = scope;
}

var EVENTS = __webpack_require__(6).EVENTS;

Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		Cbs.prototype["on" + name] = function(){
			this.scope.emit(name);
		};
	} else if(EVENTS[name] === 1){
		Cbs.prototype["on" + name] = function(a){
			this.scope.emit(name, a);
		};
	} else if(EVENTS[name] === 2){
		Cbs.prototype["on" + name] = function(a, b){
			this.scope.emit(name, a, b);
		};
	} else {
		throw Error("wrong number of arguments!");
	}
});

/***/ }),
/* 53 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 54 */
/***/ (function(module, exports) {

// Source: http://jsfiddle.net/vWx8V/
// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

/**
 * Conenience method returns corresponding value for given keyName or keyCode.
 *
 * @param {Mixed} keyCode {Number} or keyName {String}
 * @return {Mixed}
 * @api public
 */

exports = module.exports = function(searchInput) {
  // Keyboard Events
  if (searchInput && 'object' === typeof searchInput) {
    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
    if (hasKeyCode) searchInput = hasKeyCode
  }

  // Numbers
  if ('number' === typeof searchInput) return names[searchInput]

  // Everything else (cast to string)
  var search = String(searchInput)

  // check codes
  var foundNamedKey = codes[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // check aliases
  var foundNamedKey = aliases[search.toLowerCase()]
  if (foundNamedKey) return foundNamedKey

  // weird character?
  if (search.length === 1) return search.charCodeAt(0)

  return undefined
}

/**
 * Get by name
 *
 *   exports.code['enter'] // => 13
 */

var codes = exports.code = exports.codes = {
  'backspace': 8,
  'tab': 9,
  'enter': 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'pause/break': 19,
  'caps lock': 20,
  'esc': 27,
  'space': 32,
  'page up': 33,
  'page down': 34,
  'end': 35,
  'home': 36,
  'left': 37,
  'up': 38,
  'right': 39,
  'down': 40,
  'insert': 45,
  'delete': 46,
  'command': 91,
  'left command': 91,
  'right command': 93,
  'numpad *': 106,
  'numpad +': 107,
  'numpad -': 109,
  'numpad .': 110,
  'numpad /': 111,
  'num lock': 144,
  'scroll lock': 145,
  'my computer': 182,
  'my calculator': 183,
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  "'": 222
}

// Helper aliases

var aliases = exports.aliases = {
  'windows': 91,
  '⇧': 16,
  '⌥': 18,
  '⌃': 17,
  '⌘': 91,
  'ctl': 17,
  'control': 17,
  'option': 18,
  'pause': 19,
  'break': 19,
  'caps': 20,
  'return': 13,
  'escape': 27,
  'spc': 32,
  'pgup': 33,
  'pgdn': 34,
  'ins': 45,
  'del': 46,
  'cmd': 91
}


/*!
 * Programatically add the following
 */

// lower case chars
for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

// numbers
for (var i = 48; i < 58; i++) codes[i - 48] = i

// function keys
for (i = 1; i < 13; i++) codes['f'+i] = i + 111

// numpad keys
for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

/**
 * Get by code
 *
 *   exports.name[13] // => 'Enter'
 */

var names = exports.names = exports.title = {} // title for backward compat

// Create reverse mapping
for (i in codes) names[codes[i]] = i

// Add aliases
for (var alias in aliases) {
  codes[alias] = aliases[alias]
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;

var Transform = __webpack_require__(27);

/*<replacement>*/
var util = __webpack_require__(4);
util.inherits = __webpack_require__(0);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(10);
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(16).PassThrough


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(16).Transform


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(15);


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9), __webpack_require__(8)))

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = __webpack_require__(7).EventEmitter;
var inherits = __webpack_require__(0);

inherits(Stream, EE);
Stream.Readable = __webpack_require__(16);
Stream.Writable = __webpack_require__(60);
Stream.Duplex = __webpack_require__(55);
Stream.Transform = __webpack_require__(59);
Stream.PassThrough = __webpack_require__(58);

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(61);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 65 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 66 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    initialState: {
        takeDocument: {
            title: "",
            blocks: [{ kind: "paragraph", text: "" }]
        },
        activeBlockIndex: -1
    }
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var MyTake_1 = __webpack_require__(79);
exports.default = MyTake_1.default;


/***/ }),
/* 69 */,
/* 70 */,
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var ReactDOM = __webpack_require__(17);
var functions_1 = __webpack_require__(18);
var Amendments = (function (_super) {
    __extends(Amendments, _super);
    function Amendments(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClearClick = function () {
            _this.setState({
                amendmentsNodes: functions_1.getNodeArray("AMENDMENTS"),
                textIsHighlighted: false
            });
        };
        _this.handleMouseUp = function () {
            if (window.getSelection && !_this.state.textIsHighlighted) {
                // Pre IE9 will always be false
                var selection = window.getSelection();
                if (selection.toString().length) {
                    //Some text is selected
                    var range = selection.getRangeAt(0);
                    var highlightedText = functions_1.highlightText(range, _this.state.amendmentsNodes.slice(), "AMENDMENTS", ReactDOM.findDOMNode(_this).childNodes, _this.handleSetClick);
                    _this.setState({
                        amendmentsNodes: highlightedText.newNodes,
                        range: highlightedText.range,
                        textIsHighlighted: true
                    });
                }
            }
        };
        _this.handleSetClick = function () {
            _this.props.onSetClick("AMENDMENTS", _this.state.range);
        };
        _this.state = {
            amendmentsNodes: functions_1.getNodeArray("AMENDMENTS"),
            range: [0, 0],
            textIsHighlighted: false
        };
        return _this;
    }
    Amendments.prototype.render = function () {
        return (React.createElement("div", { className: "amendments" },
            React.createElement("h2", { className: "amendments__heading" }, "Amendments to the Constitution"),
            React.createElement("p", { className: "constitution__instructions" }, this.state.textIsHighlighted
                ? "Click your selection to send it to the Take."
                : "Highlight some text from the Amendments below."),
            React.createElement("button", { onClick: this.props.onBackClick }, "Back to Foundation"),
            React.createElement("button", { onClick: this.handleClearClick }, "Clear Selection"),
            React.createElement("div", { className: "amendments__row" },
                React.createElement("div", { className: "amendments__sections" },
                    React.createElement("p", null, "<This is just a placeholder block for section links to autoscroll to particular parts of the amendments>")),
                React.createElement("div", { className: "amendments__text", onMouseUp: this.handleMouseUp }, this.state.amendmentsNodes.map(function (element, index) {
                    element.props["key"] = index.toString();
                    return React.createElement(element.component, element.props, element.innerHTML);
                })))));
    };
    return Amendments;
}(React.Component));
exports.default = Amendments;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Amendments_1 = __webpack_require__(71);
exports.default = Amendments_1.default;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var ReactDOM = __webpack_require__(17);
var functions_1 = __webpack_require__(18);
var constitutionText = __webpack_require__(29);
var Constitution = (function (_super) {
    __extends(Constitution, _super);
    function Constitution(props) {
        var _this = _super.call(this, props) || this;
        _this.handleClearClick = function () {
            _this.setState({
                constitutionNodes: functions_1.getNodeArray("CONSTITUTION"),
                textIsHighlighted: false
            });
        };
        _this.handleMouseUp = function () {
            if (window.getSelection && !_this.state.textIsHighlighted) {
                // Pre IE9 will always be false
                var selection = window.getSelection();
                if (selection.toString().length) {
                    //Some text is selected
                    var range = selection.getRangeAt(0);
                    var highlightedText = functions_1.highlightText(range, _this.state.constitutionNodes.slice(), "CONSTITUTION", ReactDOM.findDOMNode(_this).childNodes, _this.handleSetClick);
                    _this.setState({
                        constitutionNodes: highlightedText.newNodes,
                        range: highlightedText.range,
                        textIsHighlighted: true
                    });
                }
            }
        };
        _this.handleSetClick = function () {
            _this.props.onSetClick("CONSTITUTION", _this.state.range);
        };
        _this.state = {
            constitutionNodes: functions_1.getNodeArray("CONSTITUTION"),
            range: [0, 0],
            textIsHighlighted: false
        };
        return _this;
    }
    Constitution.prototype.render = function () {
        return (React.createElement("div", { className: "constitution" },
            React.createElement("h2", { className: "constitution__heading" }, "Constitution for the United States of America"),
            React.createElement("p", { className: "constitution__instructions" }, this.state.textIsHighlighted
                ? "Click your selection to send it to the Take."
                : "Highlight some text from the Constitution below."),
            React.createElement("button", { onClick: this.props.onBackClick }, "Back to Foundation"),
            React.createElement("button", { onClick: this.handleClearClick }, "Clear Selection"),
            React.createElement("div", { className: "constitution__row" },
                React.createElement("div", { className: "constitution__sections" },
                    React.createElement("p", null, "<This is just a placeholder block for section links to autoscroll to particular parts of the constitution>")),
                React.createElement("div", { className: "constitution__text", onMouseUp: this.handleMouseUp }, this.state.constitutionNodes.map(function (element, index) {
                    element.props["key"] = index.toString();
                    return React.createElement(element.component, element.props, element.innerHTML);
                })))));
    };
    return Constitution;
}(React.Component));
exports.default = Constitution;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Constitution_1 = __webpack_require__(73);
exports.default = Constitution_1.default;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var Debates = (function (_super) {
    __extends(Debates, _super);
    function Debates(props) {
        return _super.call(this, props) || this;
    }
    Debates.prototype.render = function () {
        return (React.createElement("div", { className: "debates" },
            React.createElement("h2", { className: "debates__heading" }, "Debates"),
            React.createElement("p", { className: "debates__instructions" }, "Coming soon"),
            React.createElement("button", { onClick: this.props.onBackClick }, "Back to Foundation"),
            React.createElement("div", { className: "debates__placeholder" })));
    };
    return Debates;
}(React.Component));
exports.default = Debates;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Debates_1 = __webpack_require__(75);
exports.default = Debates_1.default;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var Constitution_1 = __webpack_require__(74);
var Debates_1 = __webpack_require__(76);
var Amendments_1 = __webpack_require__(72);
function AmendmentsCard(props) {
    return (React.createElement("div", { className: "foundation__card foundation__card--amendments", onClick: props.onClick },
        React.createElement("div", { className: "foundation__image-container" },
            React.createElement("img", { src: __webpack_require__(84), className: "foundation__image foundation__image--amendments", width: "220", height: "313" })),
        React.createElement("div", { className: "foundation__info-container" },
            React.createElement("h3", { className: "foundation__card-title foundation__card-title--amendments" }, "The Amendments"),
            React.createElement("p", { className: "foundation__description foundation__description--amendments" }, "The full text of the Amendments to the U.S. Constitution."))));
}
function ConstitutionCard(props) {
    return (React.createElement("div", { className: "foundation__card foundation__card--constitution", onClick: props.onClick },
        React.createElement("div", { className: "foundation__image-container" },
            React.createElement("img", { src: __webpack_require__(82), className: "foundation__image foundation__image--constitution", width: "220", height: "313" })),
        React.createElement("div", { className: "foundation__info-container" },
            React.createElement("h3", { className: "foundation__card-title foundation__card-title--constitution" }, "The Constitution"),
            React.createElement("p", { className: "foundation__description foundation__description--constitution" }, "The full text of the U.S. Constitution, as it was originally penned in 1787."))));
}
function DebatesCard(props) {
    return (React.createElement("div", { className: "foundation__card foundation__card--debates", onClick: props.onClick },
        React.createElement("div", { className: "foundation__image-container" },
            React.createElement("img", { src: __webpack_require__(83), className: "foundation__image foundation__image--debates", width: "220", height: "313" })),
        React.createElement("div", { className: "foundation__info-container" },
            React.createElement("h3", { className: "foundation__card-title foundation__card-title--debates" }, "The Debates"),
            React.createElement("p", { className: "foundation__description foundation__description--debates" }, "Full videos and transcripts of all presidential debates since 1976."))));
}
var Foundation = (function (_super) {
    __extends(Foundation, _super);
    function Foundation(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            view: "INITIAL"
        };
        _this.handleAmendmentsCardClick = _this.handleAmendmentsCardClick.bind(_this);
        _this.handleConstitutionCardClick = _this.handleConstitutionCardClick.bind(_this);
        _this.handleDebatesCardClick = _this.handleDebatesCardClick.bind(_this);
        _this.handleBackClick = _this.handleBackClick.bind(_this);
        return _this;
    }
    Foundation.prototype.handleAmendmentsCardClick = function () {
        this.setState({ view: "AMENDMENTS" });
    };
    Foundation.prototype.handleConstitutionCardClick = function () {
        this.setState({ view: "CONSTITUTION" });
    };
    Foundation.prototype.handleDebatesCardClick = function () {
        this.setState({ view: "DEBATES" });
    };
    Foundation.prototype.handleBackClick = function () {
        this.setState({ view: "INITIAL" });
    };
    Foundation.prototype.render = function () {
        var props = this.props;
        switch (this.state.view) {
            case "INITIAL":
                return (React.createElement("div", { className: "foundation" },
                    React.createElement("h2", { className: "foundation__heading" }, "The Foundation"),
                    React.createElement("p", { className: "foundation__instructions" }, "Browse the Foundation to support your take with Facts."),
                    React.createElement("div", { className: "foundation__card-list" },
                        React.createElement(AmendmentsCard, { onClick: this.handleAmendmentsCardClick }),
                        React.createElement(ConstitutionCard, { onClick: this.handleConstitutionCardClick }),
                        React.createElement(DebatesCard, { onClick: this.handleDebatesCardClick }))));
            case "AMENDMENTS":
                return (React.createElement("div", { className: "foundation" },
                    React.createElement(Amendments_1.default, { onBackClick: this.handleBackClick, onSetClick: props.handleSetClick })));
            case "CONSTITUTION":
                return (React.createElement("div", { className: "foundation" },
                    React.createElement(Constitution_1.default, { onBackClick: this.handleBackClick, onSetClick: props.handleSetClick })));
            case "DEBATES":
                return (React.createElement("div", { className: "foundation" },
                    React.createElement(Debates_1.default, { onBackClick: this.handleBackClick })));
            default:
        }
    };
    return Foundation;
}(React.Component));
exports.default = Foundation;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Foundation_1 = __webpack_require__(77);
exports.default = Foundation_1.default;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var BlockEditor_1 = __webpack_require__(31);
var Foundation_1 = __webpack_require__(78);
var MyTake = (function (_super) {
    __extends(MyTake, _super);
    function MyTake(props) {
        var _this = _super.call(this, props) || this;
        _this.addDocument = function (type, range) {
            var blocks = _this.state.takeDocument.blocks;
            var activeBlockIndex = _this.state.activeBlockIndex;
            var newBlock = {
                kind: "document",
                document: type,
                range: range
            };
            var newBlocks = blocks.slice(0, activeBlockIndex + 1).concat([
                newBlock
            ], blocks.slice(activeBlockIndex + 1));
            _this.setState({
                takeDocument: __assign({}, _this.state.takeDocument, { blocks: newBlocks }),
                activeBlockIndex: ++activeBlockIndex
            });
        };
        _this.addParagraph = function (isTitle) {
            var blocks = _this.state.takeDocument.blocks;
            var activeBlockIndex = _this.state.activeBlockIndex;
            var newIndex;
            var newBlock = {
                kind: "paragraph",
                text: ""
            };
            var newBlocks = [];
            if (isTitle) {
                newBlocks = [newBlock].concat(blocks.slice(0));
                newIndex = 0;
            }
            else {
                newBlocks = blocks.slice(0, activeBlockIndex + 1).concat([
                    newBlock
                ], blocks.slice(activeBlockIndex + 1));
                newIndex = ++activeBlockIndex;
            }
            _this.setState({
                takeDocument: __assign({}, _this.state.takeDocument, { blocks: newBlocks }),
                activeBlockIndex: newIndex
            });
        };
        _this.removeParagraph = function (idx) {
            var blocks = _this.state.takeDocument.blocks;
            if (blocks.length > 1) {
                _this.setState({
                    takeDocument: __assign({}, _this.state.takeDocument, { blocks: blocks.slice(0, idx).concat(blocks.slice(idx + 1)) })
                });
            }
            else {
                if (blocks[0].kind === "document") {
                    //User wants a fresh take, so give user an empty paragraph.
                    _this.setState({
                        takeDocument: __assign({}, _this.state.takeDocument, { blocks: [{ kind: "paragraph", text: "" }] })
                    });
                }
            }
        };
        _this.handleTakeBlockChange = function (stateIndex, value, isTitle) {
            if (isTitle) {
                // Change the title
                _this.setState({
                    takeDocument: __assign({}, _this.state.takeDocument, { title: value })
                });
            }
            else {
                var blocks_1 = _this.state.takeDocument.blocks.slice();
                var valuesArr = value.split("\n");
                var newBlock_1;
                var newBlocks_1 = [];
                var newIndex_1 = stateIndex;
                valuesArr.forEach(function (element, arrIdx) {
                    if (arrIdx === 0) {
                        newBlock_1 = blocks_1[stateIndex];
                        newBlock_1.text = element;
                    }
                    else {
                        newBlock_1 = {
                            kind: "paragraph",
                            text: element
                        };
                        newIndex_1++;
                    }
                    newBlocks_1 = newBlocks_1.concat([newBlock_1]);
                });
                newBlocks_1 = blocks_1.slice(0, stateIndex).concat(newBlocks_1, blocks_1.slice(stateIndex + 1));
                _this.setState({
                    takeDocument: __assign({}, _this.state.takeDocument, { blocks: newBlocks_1 }),
                    activeBlockIndex: newIndex_1
                });
            }
        };
        _this.handleTakeBlockFocus = function (idx) {
            _this.setActive(idx);
        };
        _this.setActive = function (idx) {
            _this.setState({
                activeBlockIndex: idx
            });
        };
        _this.state = __assign({}, props.initState);
        return _this;
    }
    MyTake.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(BlockEditor_1.default, { handleDelete: this.removeParagraph, handleChange: this.handleTakeBlockChange, handleFocus: this.handleTakeBlockFocus, handleEnter: this.addParagraph, takeDocument: Object.assign({}, this.state.takeDocument), active: this.state.activeBlockIndex }),
            React.createElement(Foundation_1.default, { handleSetClick: this.addDocument })));
    };
    return MyTake;
}(React.Component));
exports.default = MyTake;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(3);
var ReactDOM = __webpack_require__(17);
var MyTake_1 = __webpack_require__(68);
var config_1 = __webpack_require__(67);
var app = document.getElementById("app");
var initJson;
if (app.hasAttribute("data-init")) {
    initJson = JSON.parse(app.getAttribute("data-init"));
}
else {
    initJson = config_1.default.initialState;
}
var Root = React.createElement(MyTake_1.default, { initState: initJson });
ReactDOM.render(Root, app);


/***/ }),
/* 81 */,
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "b0537a0f85ed163c6fd9c5d10b4ab484.jpg";

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "ecb756d2fbec48f66b3a8d321ad6d327.jpg";

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "a6decc2717b5a6bdf7a54198907fe370.jpg";

/***/ })
/******/ ]);