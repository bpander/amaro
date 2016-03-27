define(function (require) {
    'use strict';

    var Control = require('./Control');


    function IterationControl (element, expression) {
        Control.call(this, element, expression);
    }
    IterationControl.prototype = Object.create(Control.prototype);
    IterationControl.prototype.constructor = IterationControl;


    return IterationControl;
});
