define(function (require) {
    'use strict';


    function Component (element, expression) {

        this.element = element;

        this.expression = expression;

        // TODO: Use a deep merge
        this.state = Object.assign({}, this.constructor.defaults);

        this.childComponents = [];

        this.outputs = [];

    }


    Component.defaults = {};


    Component.prototype.setState = function (state, loop) {
        // TODO: Use a deep merge
        // TODO: forEach probably not the best for performance, try regular loop?
        Object.assign(this.state, state);
        this.outputs.forEach(function (o) {
            o.evaluate(this.state);
        }, this);
        this.childComponents.forEach(function (c) {
            c.setState(this.state);
        }, this);
    };


    return Component;
});
