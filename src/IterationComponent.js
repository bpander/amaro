define(function (require) {
    'use strict';

    var Component = require('./Component');


    function IterationComponent (element) {
        Component.call(this, element);

    }
    IterationComponent.prototype = Object.create(Component.prototype);
    IterationComponent.prototype.constructor = IterationComponent;


    IterationComponent.prototype.setState = function (state, loop) {

    };


    return IterationComponent;
});
