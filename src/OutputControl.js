define(['Control'], function (Control) {
    'use strict';


    function OutputControl (element) {
        Control.call(this, element);

    }
    OutputControl.prototype = Object.create(Control.prototype);
    var proto = OutputControl.prototype;
    proto.constructor = OutputControl;


    OutputControl.merge = function (target, props) {
        var prop;
        var oldVal;
        var newVal;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                newVal = props[prop];
                if (typeof newVal === 'object') {
                    OutputControl.merge(target[prop], newVal);
                    continue;
                }
                oldVal = target[prop];
                if (oldVal !== newVal) {
                    target[prop] = props[prop];
                }
            }
        }
    };


    proto.acceptState = function (state, loop, thisArg) {
        var props = this.expression.call(thisArg, state, loop);
        OutputControl.merge(this.element, props);
        Control.prototype.acceptState.call(this, state, loop, thisArg);
        this.isMounted = true;
    };


    return OutputControl;
});
