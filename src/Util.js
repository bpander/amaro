define(function (require) {
    'use strict';


    var Util = {};


    /**
     * Create a deep copy of an object. Adapted from http://stackoverflow.com/a/728694/1159534.
     *
     * @method Util.deepCopy
     * @static
     * @param  {*} obj  The thing to clone.
     * @return {*}      A clone of the input except if the input was a primitive in which case it returns the primitive.
     */
    Util.deepCopy = function (obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (obj == null || typeof obj !== 'object') {
            return obj;
        }

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = Util.deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    copy[prop] = Util.deepCopy(obj[prop]);
                }
            }
            return copy;
        }

        throw new Error('Unable to copy input! Its type isn\'t supported.');
    };


    return Util;
});
