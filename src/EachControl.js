define(function (require) {
    'use strict';

    var Control = require('./Control');


    function EachControl (element) {
        Control.call(this, element);

        this.iterations = {};

    }
    EachControl.prototype = Object.create(Control.prototype);
    EachControl.prototype.constructor = EachControl;


    EachControl.prototype.acceptState = function (state, loop) {

    };


    return EachControl;
});
