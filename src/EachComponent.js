define(function (require) {
    'use strict';

    var Component = require('./Component');


    function EachComponent (element) {
        Component.call(this, element);

        this.iterations = {};

    }
    EachComponent.prototype = Object.create(Component.prototype);
    EachComponent.prototype.constructor = EachComponent;


    EachComponent.prototype.setState = function (state) {

    };


    return EachComponent;
});
