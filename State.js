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

    var State = {};

    State.mount = function (element, Component, initialProps) {
        var component = new Component(element, initialProps);
        var i;
        var l;
        var ifElement;
        var ifElements = element.querySelectorAll('[data-if]');
        var states = [];
        var state;
        for (i = 0, l = ifElements.length; i < l; i++) {
            ifElement = ifElements[i];
            state = new State.IfControl(
                ifElement,
                (new Function('props', 'return ' + ifElement.dataset.if + ';')).bind(this)
            );
            component.controls.push(state);
        }
        return component;
    };

    State.IfControl = function IfControl (element, condition) {

        this.element = element;

        this.parentNode = element.parentNode;

        this.condition = condition;

        this.nextSiblings = State._getNextSiblings(element);

    };

    State.IfControl.prototype.exec = function (props) {
        var isTruthy = this.condition(props) == true;
        if (isTruthy) {
            this.parentNode.insertBefore(this.element, this.nextSiblings[0]);
        } else {
            if (this.element.parentNode === this.parentNode) {
                this.parentNode.removeChild(this.element);
            }
        }
    };


    State._getNextSiblings = function (element) {
        var sibling = element;
        var nextSiblings = [];
        while ((sibling = sibling.nextSibling) !== null) {
            nextSiblings.push(sibling);
        }
        return nextSiblings;
    };


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


    State.Component = function Component (element, props) {

        this.element = element;

        this.props = props;

        this.controls = [];

    }


    /**
     * Performs a shallow merge on the `model` data.
     */
    State.Component.prototype.set = function (model) {
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
