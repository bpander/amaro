define(function (require) {
    'use strict';


    function Control (element, expression) {

        this.element = element;

        this.expression = expression;

        this.children = [];

    }


    Control.prototype.acceptState = function (state, loop) {

    };


    return Control;
});
