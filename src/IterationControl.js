define(function (require) {
    'use strict';

    var Control = require('./Control');


    function IterationControl (element) {
        Control.call(this, element);

        this.childNodes = Array.prototype.slice.call(element.childNodes, 0);

        this.index = -1;

    }
    IterationControl.prototype = Object.create(Control.prototype);
    IterationControl.prototype.constructor = IterationControl;


    return IterationControl;
});
