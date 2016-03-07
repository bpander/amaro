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


    function State (elements, model) {

        this.elements = elements;

        this.model = model;

        this.map = elements.map(function (element) {
            return {
                element: element,
                template: State._compileObjectTemplate(element.dataset[State.DATA_ATTRIBUTE])
            };
        });
    }


    State.DATA_ATTRIBUTE = 'props';

    State.VAR_NAME = 'model';


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
     * Performs a shallow merge on the `model` data.
     */
    State.prototype.set = function (model) {
        var grouping;
        var props;
        var i;
        var l;
        Object.assign(this.model, model);
        for (i = 0, l = this.map.length; i < l; i++) {
            grouping = this.map[i];
            props = grouping.template(this.model);
            State._merge(grouping.element, props);
        }
    };


    return State;
}));
