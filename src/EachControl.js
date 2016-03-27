define(function (require) {
    'use strict';

    var Control = require('./Control');
    var IterationControl = require('./IterationControl');


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
            var key = this.keyExpression(state, loop);
            var iteration = this.iterations[key];
            if (iteration === undefined) {
                iteration = this.createIteration();
                this.iterations[key] = iteration;
            }
        }, this);
    };


    EachControl.prototype.createIteration = function () {
        var element = this.element.cloneNode(true);
        var iteration = new IterationControl(element);
        // TODO: Find a way to make this recursive so nested children get cloned on
        iteration.children = this.children.map(function (c) {
            var selector = '[data-control-' + this.id + '-' + c.id + ']';
            return c.cloneOn(document.querySelector(selector));
        }, this);
        return iteration;
    };


    return EachControl;
});
