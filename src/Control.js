define(function (require) {
    'use strict';

    var Animator = require('./Animator');


    function Control (element) {

        this.element = element;

        this.expression = _defaultExpression;

        this.children = [];

        this.parent = null;

        this.original = this;

        this.id = _id++;

        this.isMounted = false;

        this.animator = new Animator();

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
        var type = (this.isMounted) ? Animator.TYPE.ENTER : Animator.TYPE.APPEAR;
        return this.animator.animate([ this.element ], type);
    };


    Control.prototype.leave = function () {
        if (!this.isMounted) {
            return Promise.resolve();
        }
        return this.animator.animate([ this.element ], Animator.TYPE.LEAVE);
    };


    Control.prototype.unmount = function () {

    };


    return Control;
});
