define(function (require) {
    'use strict';

    var Util = require('./Util');


    function AnimationQueue () {

        this.additions = [];

        this.removals = [];

        this.addTimeoutId = -1;

        this.removeTimeoutId = -1;

        this._enterClass;

        this._enterActiveClass;

        this._leaveClass;

        this._leaveActiveClass;

    }
    var proto = AnimationQueue.prototype;


    var _splitRegExp = /,\s?/;


    AnimationQueue.getTotalTransitionDuration = function (element) {
        var totalTransitionDuration = 0;
        var computedStyle = getComputedStyle(element);
        var transitionDurations = computedStyle.transitionDuration.split(_splitRegExp);
        var transitionDelays = computedStyle.transitionDelay.split(_splitRegExp);
        var i;
        var l;
        for (i = 0, l = transitionDurations.length; i < l; i++) {
            totalTransitionDuration = Math.max(totalTransitionDuration, parseFloat(transitionDurations[i]) + parseFloat(transitionDelays[i]));
        }
        totalTransitionDuration *= 1000; // Convert to ms
        return totalTransitionDuration;
    };


    proto.setPrefix = function (prefix) {
        this._enterClass         = prefix + '-enter';
        this._enterActiveClass   = prefix + '-enter-active';
        this._leaveClass         = prefix + '-leave';
        this._leaveActiveClass   = prefix + '-leave-active';
    };


    proto.jumpToEnd = function () {
        clearTimeout(this.addTimeoutId);
        clearTimeout(this.removeTimeoutId);
        this.handleAddDone();
        this.handleRemoveDone();
        return this;
    };


    proto.add = function (elements) {
        this.additions = elements;
        return this;
    };


    proto.remove = function (elements) {
        this.removals = elements;
        return this;
    };


    proto.process = function () {
        var transitionDurations;
        var i;
        var l;
        var element;

        for (i = 0, l = this.additions.length, transitionDurations = []; i < l; i++) {
            element = this.additions[i];
            element.classList.add('-enter');
            transitionDurations.push(AnimationQueue.getTotalTransitionDuration(element));
            element.classList.add('-enter-active');
        }
        this.addTimeoutId = setTimeout(this.handleAddDone.bind(this), Math.max.apply(null, transitionDurations));

        for (i = 0, l = this.removals.length, transitionDurations = []; i < l; i++) {
            element = this.removals[i];
            element.classList.add('-leave');
            transitionDurations.push(AnimationQueue.getTotalTransitionDuration(element));
            element.classList.add('-leave-active');
        }
        this.removeTimeoutId = setTimeout(this.handleRemoveDone.bind(this), Math.max.apply(null, transitionDurations));
    };


    proto.handleAddDone = function () {
        var i;
        var l;
        var element;
        for (i = 0, l = this.additions.length; i < l; i++) {
            element = this.additions[i];
            element.classList.remove('-enter', '-enter-active');
        }
        this.additions = [];
    };


    proto.handleRemoveDone = function () {
        var i;
        var l;
        var element;
        for (i = 0, l = this.removals.length; i < l; i++) {
            element = this.removals[i];
            element.classList.remove('-leave', '-leave-active');
            if (element.parentNode !== null) {
                element.parentNode.removeChild(element);
            }
        }
        this.removals = [];
    };


    return AnimationQueue;
});
