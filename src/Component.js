define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function Component (element, expression) {
        Control.call(this, element, expression);

        this.state = Util.deepCopy(this.constructor.defaults);

    }
    Component.prototype = Object.create(Control.prototype);
    Component.prototype.constructor = Component;


    Component.defaults = {};


    Component.prototype.acceptState = function (state, loop) {
        this.setState(this.expression(state, loop), loop);
    };


    Component.prototype.setState = function (state, loop) {
        var i;
        var l;
        Object.assign(this.state, state);
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(this.state, loop);
        }
    };


    Component.prototype.elementWillAttach = function (element, resolve) {
        // TODO: Implement this method
        resolve();
    };


    Component.prototype.elementWillDetach = function (element, resolve) {
        // TODO: Implement this method
        resolve();
    };


    Component.prototype.elementWillReorder = function (element, resolve) {
        // TODO: Implement this method
        resolve();
    };


    return Component;
});
