define(function (require) {
    'use strict';

    var Util = require('./Util');


    function AnimationQueue () {

        this.callback = Util.noop;

        this.timeoutId = -1;

    }
    var proto = AnimationQueue.prototype;


    proto.jumpToEnd = function () {
        this.callback();
        clearTimeout(this.timeoutId);
        return this;
    };


    proto.add = function (element, insertFn) {
        element.classList.add('-enter');
        insertFn();

        // TODO: Take transition-delay into account in both add and remove
        var transitionDuration = Math.max.apply(null, getComputedStyle(element).transitionDuration.split(/,\s?/).map(parseFloat)) * 1000;

        element.classList.add('-enter-active');
        this.callback = function () {
            element.classList.remove('-enter', '-enter-active');
            this.callback = Util.noop;
        }.bind(this);
        this.timeoutId = setTimeout(this.callback, transitionDuration);
        return this;
    };


    proto.remove = function (element, removeFn) {
        element.classList.add('-leave');
        var transitionDuration = Math.max.apply(null, getComputedStyle(element).transitionDuration.split(/,\s?/).map(parseFloat)) * 1000;
        element.classList.add('-leave-active');
        this.callback = function () {
            removeFn();
            element.classList.remove('-leave', '-leave-active');
            this.callback = Util.noop;
        }.bind(this);
        this.timeoutId = setTimeout(this.callback, transitionDuration);
        return this;
    };


    return AnimationQueue;
});
