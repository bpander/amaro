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


    EachControl.prototype.acceptState = function (state, loop, thisArg) {
        var obj = this.expression.call(thisArg, state, loop);
        loop = {
            key: null,
            val: null,
            outer: loop
        };

        var docFrag = document.createDocumentFragment();
        Object.keys(obj).forEach(function (key) {
            loop.key = key;
            loop.val = obj[key];
            var iterationKey = this.keyExpression.call(thisArg, state, loop);
            var iteration = this.iterations[iterationKey];
            if (iteration === undefined) {
                iteration = this.createIteration();
                this.iterations[iterationKey] = iteration;
            }
            iteration.acceptState(state, loop, thisArg);
            iteration.childNodes.forEach(function (node) {
                docFrag.appendChild(node);
            });
        }, this);
        // TODO: It should probably be smarter about how it updates the list
        // Like, it won't touch the node if it's in the correct spot
        this.element.innerHTML = '';
        this.element.appendChild(docFrag);
    };


    EachControl.prototype.copyChildrenFrom = function (source) {
        this.template = source.template;
        Control.prototype.copyChildrenFrom.call(this, source);
    };


    EachControl.prototype.controlDidMount = function () {
        Control.prototype.controlDidMount.call(this);
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
