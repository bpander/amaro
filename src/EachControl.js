define(function (require) {
    'use strict';

    var Control = require('./Control');
    var IterationControl = require('./IterationControl');


    function EachControl (element, expression, keyExpression) {
        Control.call(this, element, expression);

        this.keyExpression = keyExpression;

        this.template = document.createElement('template');

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
            var key = this.keyExpression(state, loop);
            var iteration = this.iterations[key];
            if (iteration === undefined) {
                iteration = IterationControl.from(this);
                this.iterations[key] = iteration;
            }
            iteration.acceptState(state, loop);
            Array.prototype.forEach.call(iteration.element.children, function (node) {
                this.element.appendChild(node);
            }, this);
        }, this);
    };


    return EachControl;
});
