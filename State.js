(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Global Variables
    root.State = factory();
  }
}(this, function () {
    'use strict';


    function State (elements, state) {

        this.elements = elements;

        this.state = state;

        this.map = elements.map(function (element) {
            return {
                element: element,
                template: State._compileObjectTemplate(element.dataset[State.DATA_ATTRIBUTE])
            };
        });
    }


    State.DATA_ATTRIBUTE = 'props';

    State.VAR_NAME = 'state';


    State._compileObjectTemplate = function (templateString) {
        return new Function(State.VAR_NAME, 'return ' + templateString + ';');
    };


    State._merge = function (target, props) {
        var prop;
        var oldVal;
        var newVal;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                newVal = props[prop];
                if (newVal instanceof Object) {
                    State._merge(target[prop], newVal);
                    continue;
                }
                oldVal = target[prop];
                if (oldVal !== newVal) {
                    target[prop] = props[prop];
                }
            }
        }
    };


    /**
     * Performs a shallow merge on the `state` data.
     */
    State.prototype.set = function (state) {
        var grouping;
        var props;
        var i;
        var l;
        Object.assign(this.state, state);
        for (i = 0, l = this.map.length; i < l; i++) {
            grouping = this.map[i];
            props = grouping.template(this.state);
            State._merge(grouping.element, props);
        }
    };


    return State;
}));
