define(function (require) {
    'use strict';

    var Control = require('./Control');


    function EachControl (element, expression, keyExpression) {
        Control.call(this, element, expression);

        this.keyExpression = keyExpression;

        this.iterations = {};

    }
    EachControl.prototype = Object.create(Control.prototype);
    EachControl.prototype.constructor = EachControl;


    EachControl.prototype.acceptState = function (state, loop) {
        // TODO: This should also be able to iterate over objects
        var arr = this.expression(state, loop);
        loop = {
            key: null,
            val: null,
            outer: loop
        };
        arr.forEach(function (item, i) {
            loop.key = i;
            loop.val = item;
            console.log(this.keyExpression(state, loop));
        }, this);
    };


    return EachControl;
});
