define(function (require) {
    'use strict';

    var Control = require('./Control');


    function IterationControl (element, expression) {
        Control.call(this, element, expression);

        this.childNodes = Array.prototype.slice.call(element.childNodes, 0);

    }
    IterationControl.prototype = Object.create(Control.prototype);
    IterationControl.prototype.constructor = IterationControl;


    IterationControl.from = function (eachControl) {
        var iteration = new IterationControl(eachControl.template.cloneNode(true));
        IterationControl.copyChildren(iteration, eachControl);
        return iteration;
    };


    IterationControl.copyChildren = function (target, template) {
        target.children = template.children.map(function (c) {
            var selector = '[data-control-' + template.id + '-' + c.id + ']';
            // TODO: Make sure this works on elements that have multiple controls on them
            var element = target.element.querySelector(selector);
            if (element === null) {
                if (target.element.matches(selector)) {
                    element = target.element;
                } else {
                    element = target.template.querySelector(selector);
                }
            }
            var clone = c.cloneOn(element);
            IterationControl.copyChildren(clone, c);
            return clone;
        });
    };


    return IterationControl;
});
