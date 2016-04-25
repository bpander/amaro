define(function (require) {
    'use strict';


    var Util = {};


    Util.noop = Function.prototype;


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


    Util.getNextSiblings = function (element) {
        var sibling = element;
        var nextSiblings = [];
        while ((sibling = sibling.nextSibling) !== null) {
            nextSiblings.push(sibling);
        }
        return nextSiblings;
    };


    Util.getTotalTransitionTime = function (element) {
        var totalTransitionTime = 0;
        var computedStyle = getComputedStyle(element);
        var transitionDurations = computedStyle.transitionDuration.split(', ');
        var transitionDelays = computedStyle.transitionDelay.split(', ');
        var i;
        var l;
        for (i = 0, l = transitionDurations.length; i < l; i++) {
            totalTransitionTime = Math.max(totalTransitionTime, parseFloat(transitionDurations[i]) + parseFloat(transitionDelays[i]));
        }
        totalTransitionTime *= 1000; // Convert to ms
        return totalTransitionTime;
    };


    Util.forceRedraw = function (element) {
        var display = element.style.display;
        element.style.display = 'none';
        element.offsetWidth;
        element.style.display = display;
    };


    return Util;
});
