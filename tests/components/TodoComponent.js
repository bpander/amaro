define(function (require) {
    'use strict';

    var Component = require('../../src/Component');


    function TodoComponent (element, initialState) {
        Component.call(this, element, initialState);
    }
    TodoComponent.prototype = Object.create(Component.prototype);
    TodoComponent.prototype.constructor = TodoComponent;


    return TodoComponent;
});
