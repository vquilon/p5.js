'use strict';

/**
 * @module util
 */

/**
 * A basic object that can be used to extend
 *
 * @class Obj
 * @constructor
 */
var Obj = function() {};

/**
 * Extend a class
 *
 * @method extend
 * @static
 * @param {Function} [parent=Obj] The parent class
 * @param {Object} proto The prototype methods
 * @param {Object} [staticProps={}] The static properties
 * @return {Function} The created class
 */
Obj.extend = function() {
    var parent = Object,
        proto,
        staticProps = {};
    if (arguments.length === 1) { // Only proto supplied
        proto = arguments[0];
    } else if (arguments.length === 2) {
        if (arguments[0] instanceof Function) { // Parent and proto supplied
            parent = arguments[0];
            proto = arguments[1];
        } else { // Proto and staticProps supplied
            proto = arguments[0];
            staticProps = arguments[1];
        }
    } else {
        parent = arguments[0];
        proto = arguments[1];
        staticProps = arguments[2];
    }
    var cls = function() {
        // TODO: Make sure this call is an object creator
        // Call the init function
        if ('init' in this) {
            this.init.apply(this, arguments);
        }
    };
    cls.prototype = Object.create(parent.prototype);
    cls.prototype.constructor = cls;
    
    // Add the prototype methods
    for (var func in proto) {
        cls.prototype[func] = proto[func];
    }
    
    // Add the static methods
    for (var staticFunc in staticProps) {
        cls[staticFunc] = staticProps[staticFunc];
    }
    
    return cls;
};

/**
 * Clone an object
 *
 * @method clone
 * @static
 * @param {Object} source The object to clone
 * @param {[String]} [ignoreAttrs] Array of ignored attributes within the source
 * @return {Object} The cloned object
 */
Obj.clone = function(source, ignoreAttrs) {
    if (source === null) {
        return null;
    }
    ignoreAttrs = ignoreAttrs || [];

    // Check whether we are dealing with an array
    if (typeof source === 'object' && source.constructor === Array) {
        // Source is an array, so we copy every (non-function) value from the source into our result
        var res = [];
        for (var key = 0, destKey = 0; key < source.length; key++) {
            var type = typeof source[key];
            if (type === 'object') {
                res[destKey++] = Obj.clone(source[key], ignoreAttrs); // Recursive call
            } else if (type !== 'function') {
                res[destKey++] = source[key];
            }
        }
        return res;
    } else if (typeof source === 'object') {
        // Just an object, so we copy every defined property (as long it's not a function) of this object.
        var res = {};
        for (var key in source) {
            if (source.hasOwnProperty(key) && ignoreAttrs.indexOf(key) === -1) {
                var type = typeof source[key];
                if (type === 'object') {
                    var subIgnoreAttrs = [];
                    for (var i = 0; i < ignoreAttrs.length; i++) {
                        if (ignoreAttrs[i].indexOf(key + '.') === 0) {
                            subIgnoreAttrs.push(ignoreAttrs[i].substring(key.length + 1));
                        }
                    }
                    res[key] = Obj.clone(source[key], subIgnoreAttrs); // Recursive call
                } else if (type !== 'function') {
                    res[key] = source[key];
                }
            }
        }
        return res;
    } else if (typeof source === 'function') {
        throw new Error("Function cloning is not supported.");
    } else {
        return source; // Just return the value..
    }
};


/**
 * Returns true if the two given objects are equal
 * or if the values of both objects are equal for all properties defined in the given keys array.
 *
 * @method equals
 * @static
 * @param {Object} a the first object
 * @param {Object} b the second object
 * @param {Array} [keys] a set of property names to compare
 * @returns {boolean} true if equal, false otherwise
 */
Obj.equals = function (a, b, keys) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    if (keys && typeof a === 'object' && typeof b === 'object') {
        for (var i = 0; i < keys.length; i++) {
            if (a[keys[i]] != b[keys[i]]) {
                return false;
            }
        }
        return true;
    }
    return false;
};
