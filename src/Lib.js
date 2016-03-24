define(function (require) {
    'use strict';

    var IfComponent = require('./IfComponent');


    var Lib = {};


    Lib.componentMap = {};


    Lib.mount = function (element, Component, initialState) {
        var rootComponent = new Component(element, initialState);
        var stack = [];
        var addToTree = function (component) {
            var element = component.element;
            var counterComponent;
            var i = stack.length;
            stack.push(component);
            while (--i >= 0) {
                counterComponent = stack[i];
                if (counterComponent.element.contains(element) || counterComponent.element === element) {
                    counterComponent.childComponents.push(component);
                    return;
                }
            }
            rootComponent.childComponents.push(component);
        };
        var elements = element.querySelectorAll('[data-if], [data-component]');
        Array.prototype.forEach.call(elements, function (element, i) {
            var ifExpr = element.dataset.if;
            var componentExpr = element.dataset.component;
            if (ifExpr) {
                // TODO: Maybe pass in ifExpr into constructor to eliminate duplicate retrieval?
                addToTree(new IfComponent(element));
            }
            if (componentExpr) {
                // TODO: Implement data attribute that transfers state to child components
                var Component = Lib.componentMap[componentExpr];
                addToTree(new Component(element));
            }
        });

        rootComponent.setState();

        return rootComponent;
    };


    return Lib;
});
