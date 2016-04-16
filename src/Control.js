define(function (require) {
    'use strict';


    function Control (element, expression) {

        this.element = element;

        this.expression = expression;

        this.children = [];

        this.parent = null;

        this.original = this;

        this.id = _id++;

    }


    var _id = 1;


    Control.prototype.acceptState = function (state, loop, thisArg) {
        var i;
        var l;
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(state, loop, thisArg);
        }
    };


    Control.prototype.addChild = function (control) {
        control.parent = this;
        this.children.push(control);
        control.element.setAttribute('data-control-' + this.id + '-' + control.id, '');
    };


    Control.prototype.cloneOn = function (element) {
        var Constructor = this.constructor;
        var instance = new Constructor(element, this.expression, this.keyExpression);
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


    return Control;
});
