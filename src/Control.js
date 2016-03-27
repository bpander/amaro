define(function (require) {
    'use strict';


    function Control (element, expression) {

        this.element = element;

        this.expression = expression;

        this.children = [];

        this.id = _id++;

    }

    var _id = 1;


    Control.prototype.acceptState = function (state, loop) {
        var i;
        var l;
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(state, loop);
        }
    };


    Control.prototype.moldify = function (parentId) {
        this.element.setAttribute('data-control-' + parentId + '-' + this.id, '');
    };


    Control.prototype.cloneOn = function (element) {
        var Constructor = this.constructor;
        var instance = new Constructor();
        var prop;
        for (prop in instance) {
            if (instance.hasOwnProperty(prop)) {
                instance[prop] = this[prop];
            }
        }
        instance.element = element;
        return instance;
    };


    return Control;
});
