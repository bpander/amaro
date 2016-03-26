define(function (require) {
    'use strict';


    function Output (element, expression) {

        this.element = element;

        this.expression = expression;

    }


    Output.merge = function (target, props) {
        var prop;
        var oldVal;
        var newVal;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                newVal = props[prop];
                if (newVal instanceof Object) {
                    Output.merge(target[prop], newVal);
                    continue;
                }
                oldVal = target[prop];
                if (oldVal !== newVal) {
                    target[prop] = props[prop];
                }
            }
        }
    };


    Output.prototype.evaluate = function (state) {
        var props = this.expression(state);
        Output.merge(this.element, props);
    };


    return Output;
});
