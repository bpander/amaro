define(function (require) {
    'use strict';

    var Util = require('./Util');


    function Control (element) {

        this.element = element;

        this.expression = _defaultExpression;

        this.children = [];

        this.parent = null;

        this.original = this;

        this.id = _id++;

        this.isMounted = false;

        this.shouldAnimate = true; // TODO: Implement

        this.rejectPreviousAnimation = Util.noop;

    }


    var _id = 1;

    var _defaultExpression = function (x) {
        return x;
    };


    Control.prototype.acceptState = function (state, loop, thisArg) {
        var i;
        var l;
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(state, loop, thisArg);
        }
        this.isMounted = true;
    };


    Control.prototype.addChild = function (control) {
        control.parent = this;
        this.children.push(control);
        control.element.setAttribute('data-control-' + this.id + '-' + control.id, '');
    };


    Control.prototype.cloneOn = function (element) {
        var Constructor = this.constructor;
        var instance = new Constructor(element);
        instance.expression = this.expression;
        if (this.keyExpression !== undefined) {
            instance.keyExpression = this.keyExpression;
        }
        instance.original = this.original;
        instance.copyChildrenFrom(this);
        return instance;
    };


    Control.prototype.addToTree = function (control) {
        var children = this.children;
        var child;
        var i;
        var l;
        for (i = 0, l = children.length; i < l; i++) {
            child = children[i];
            if (child.element.contains(control.element) || child.element === control.element) {
                child.addToTree(control);
                return;
            }
        }
        this.addChild(control);
    };


    Control.prototype.controlDidParse = function () {
        var i;
        var l;
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].controlDidParse();
        }
    };


    Control.prototype.copyChildrenFrom = function (source) {
        this.children = source.children.map(function (child) {
            var element;
            var attribute = 'data-control-' + source.original.id + '-' + child.original.id;
            if (this.element.hasAttribute(attribute)) {
                element = this.element;
            } else {
                element = this.element.querySelector('[' + attribute + ']');
            }

            // TODO: Think of a better way to do this
            if (element === null) {
                element = this.template.querySelector('[' + attribute + ']');
            }

            var clone = child.cloneOn(element);
            clone.parent = this;
            return clone;
        }, this);
    };


    Control.prototype.enter = function () {
        if (!this.shouldAnimate) {
            return;
        }
        var always = function () {
            this.element.classList.remove('-enter', '-enter-active');
        }.bind(this);
        var promise;
        this.rejectPreviousAnimation();
        promise = new Promise(function (resolve, reject) {
            var transitionTime;
            this.rejectPreviousAnimation = reject;
            this.element.classList.add('-enter');
            transitionTime = Util.getTotalTransitionTime(this.element);
            if (transitionTime === 0) {
                resolve();
                return;
            }
            this.element.classList.add('-enter-active');
            setTimeout(resolve, transitionTime);
        }.bind(this));
        promise.then(always, always);
        return promise;
    };


    Control.prototype.leave = function () {
        if (!this.shouldAnimate || !this.isMounted) {
            return Promise.resolve();
        }
        var always = function () {
            this.element.classList.remove('-leave', '-leave-active')
        }.bind(this);
        var promise;
        this.rejectPreviousAnimation();
        promise = new Promise(function (resolve, reject) {
            var transitionTime;
            this.rejectPreviousAnimation = reject;
            this.element.classList.add('-leave');
            transitionTime = Util.getTotalTransitionTime(this.element);
            if (transitionTime === 0) {
                resolve();
                return;
            }
            this.element.classList.add('-leave-active');
            setTimeout(resolve, transitionTime);
        }.bind(this));
        promise.then(always, always);
        return promise;
    };


    Control.prototype.unmount = function () {

    };


    return Control;
});
