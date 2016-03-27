define(function (require) {
    'use strict';

    var Control = require('./Control');


    function Component (element, expression) {
        Control.call(this, element, expression);

        // TODO: Use a deep merge
        this.state = Object.assign({}, this.constructor.defaults);

    }


    Component.defaults = {};


    Component.prototype.acceptState = function (state, loop) {
        this.setState(this.expression(state, loop), loop);
    };


    Component.prototype.setState = function (state, loop) {
        // TODO: Use a deep merge
        // TODO: forEach probably not the best for performance, try regular loop?
        Object.assign(this.state, state);
        this.children.forEach(function (c) {
            c.acceptState(this.state, loop);
        }, this);
    };


    return Component;
});
