define(function (require) {
    'use strict';

    var IfComponent = require('./IfComponent');
    var EachComponent = require('./EachComponent');
    var Output = require('./Output');


    var Lib = {};


    Lib.componentMap = {};


    Lib.mount = function (element, Component, initialState) {
        var rootComponent = new Component(element);
        var stack = [];
        var addToTree = function (component) {
            var element = component.element;
            var counterComponent;
            var i = stack.length;
            stack.push(component);
            while (--i >= 0) {
                counterComponent = stack[i];
                if (counterComponent.element.contains(element) || counterComponent.element === element) {
                    // TODO: This seems a little messy, clean it up later. `addToTree` in general should probably be refactored.
                    if (component instanceof Output) {
                        counterComponent.outputs.push(component);
                    } else {
                        counterComponent.childComponents.push(component);
                    }
                    return;
                }
            }
            rootComponent.childComponents.push(component);
        };
        var elements = element.querySelectorAll('[data-out], [data-if], [data-component], [data-each]');
        Array.prototype.forEach.call(elements, function (element, i) {
            var outExpr = element.dataset.out;
            var ifExpr = element.dataset.if;
            var componentExpr = element.dataset.component;
            var eachExpr = element.dataset.each;
            var compiled;

            if (outExpr) {
                compiled = Lib.compileExpression(outExpr);
                addToTree(new Output(element, compiled));
            }
            if (ifExpr) {
                compiled = Lib.compileExpression(ifExpr);
                addToTree(new IfComponent(element, compiled));
            }
            if (componentExpr) {
                // TODO: Implement data attribute that transfers state to child components
                var Component = Lib.componentMap[componentExpr];
                compiled = Lib.compileExpression(element.dataset.state);
                addToTree(new Component(element, compiled));
            }
            if (eachExpr) {
                addToTree(new EachComponent(element));
            }
        });

        rootComponent.setState(initialState);

        return rootComponent;
    };


    Lib.compileExpression = function (expression) {
        // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
        return new Function('state, loop', 'return ' + expression + ';');
    };


    return Lib;
});
