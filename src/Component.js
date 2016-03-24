define(function (require) {
    'use strict';


    function Component (element, initialState) {

        this.element = element;

        // TODO: Use a deep merge
        this.state = Object.assign({}, this.constructor.defaults, initialState);

        this.childComponents = [];

    }


    Component.defaults = {};


    Component.prototype.setState = function (state) {
        // TODO: Use a deep merge
        Object.assign(this.state, state);
        this.childComponents.forEach(function (c) {
            c.setState(this.state);
        }, this);
    };


    return Component;
});
