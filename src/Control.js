define(function (require) {
    'use strict';


    function Control (element, expression) {

        this.element = element;

        this.expression = expression;

        this.children = [];

        this.parent = null;

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
        var instance = new Constructor();
        var prop;
        for (prop in instance) {
            if (instance.hasOwnProperty(prop)) {
                // TODO: There needs to be a better way of knowing if a property should be a clone or a reference
                if (prop === 'iterations') {
                    instance.iterations = {};
                } else {
                    instance[prop] = this[prop];
                }
            }
        }
        instance.element = element;
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


    return Control;
});
