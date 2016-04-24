define(function (require) {
    'use strict';

    var Control = require('./Control');
    var IterationControl = require('./IterationControl');
    var Util = require('./Util');


    function EachControl (element) {
        Control.call(this, element);

        this.keyExpression = Util.noop;

        this.template = document.createElement('template');

        this.iterations = {};

    }
    EachControl.prototype = Object.create(Control.prototype);
    EachControl.prototype.constructor = EachControl;


    EachControl.prototype.acceptState = function (state, loop, thisArg) {
        var obj = this.expression.call(thisArg, state, loop);
        var iterations = {};
        loop = {
            key: null,
            val: null,
            outer: loop
        };

        Object.keys(obj).forEach(function (key, i) {

            // Manage loop vars
            loop.key = key;
            loop.val = obj[key];

            // Grab the cached iteration or create a new one if necessary
            var iterationKey = this.keyExpression.call(thisArg, state, loop);
            var iteration = this.iterations[iterationKey];
            if (iteration === undefined) {
                iteration = this.createIteration();
            }

            // Move the iteration from the old hash table to the new one
            delete this.iterations[iterationKey];
            iterations[iterationKey] = iteration;

            // If the iteration has a different index than what it used to, append it now
            if (iteration.index !== i) {
                iteration.index = i;
                iteration.childNodes.forEach(function (node) {
                    this.element.appendChild(node);
                }, this);
                iteration.enter();
            }

            // Trickle the state down
            iteration.acceptState(state, loop, thisArg);
        }, this);

        // Detach leftover iterations from the old hash table
        Object.keys(this.iterations).forEach(function (key) {
            var iteration = this.iterations[key];
            iteration.unmount();
            iteration.leave().then(function () {
                delete iterations[key];
            });
        }, this);

        // Store a reference to the new hash table
        this.iterations = iterations;
        this.isMounted = true;
    };


    EachControl.prototype.copyChildrenFrom = function (source) {
        this.template = source.template;
        Control.prototype.copyChildrenFrom.call(this, source);
    };


    EachControl.prototype.controlDidParse = function () {
        Control.prototype.controlDidParse.call(this);
        var childElements = Array.prototype.slice.call(this.element.children);
        var i;
        var l;
        for (i = 0, l = childElements.length; i < l; i++) {
            this.template.appendChild(childElements[i]);
        }
    };


    EachControl.prototype.createIteration = function () {
        var element = this.template.cloneNode(true);
        var iteration = new IterationControl(element);
        iteration.parent = this;
        iteration.copyChildrenFrom(this);
        return iteration;
    };


    return EachControl;
});
