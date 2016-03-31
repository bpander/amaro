define(function (require) {
    'use strict';

    var Component = require('./Component');
    var IfControl = require('./IfControl');
    var EachControl = require('./EachControl');
    var OutputControl = require('./OutputControl');


    var Lib = {};


    Lib.componentMap = {};


    Lib.mount = function (element, T, initialState) {
        var rootComponent = new T(element);
        var stack = [ rootComponent ];
        var eachControls = [];
        // TODO: `addToTree` should probably be refactored.
        var addToTree = function (control) {
            var element = control.element;
            var otherControl;
            var previousLength = stack.length;
            var i;
            if (control.constructor !== OutputControl) {
                stack.push(control);
            }

            i = previousLength;
            while (--i >= 0) {
                otherControl = stack[i];
                if (otherControl instanceof Component) {
                    control.expression = control.expression.bind(otherControl);
                    break;
                }
            }

            i = previousLength;
            while (--i >= 0) {
                otherControl = stack[i];
                if (otherControl.element.contains(element) || otherControl.element === element) {
                    otherControl.children.push(control);
                    control.moldify(otherControl.id);
                    break;
                }
            }
        };
        var elements = element.querySelectorAll('[data-if], [data-out], [data-component], [data-each]');
        Array.prototype.forEach.call(elements, function (element, i) {
            var outExpr = element.dataset.out;
            var ifExpr = element.dataset.if;
            var componentExpr = element.dataset.component;
            var eachExpr = element.dataset.each;
            var compiled;

            if (ifExpr !== undefined) {
                compiled = Lib.compileExpression(ifExpr);
                addToTree(new IfControl(element, compiled));
            }
            if (outExpr !== undefined) {
                compiled = Lib.compileExpression(outExpr);
                addToTree(new OutputControl(element, compiled));
            }
            if (componentExpr !== undefined) {
                // TODO: Think of a better way to do get the ComponentConstructor
                var ComponentConstructor = Lib.componentMap[componentExpr];
                compiled = Lib.compileExpression(element.dataset.state);
                addToTree(new ComponentConstructor(element, compiled));
            }
            if (eachExpr !== undefined) {
                var control;
                var keyExpression = Lib.compileExpression(element.dataset.key);
                compiled = Lib.compileExpression(eachExpr);
                control = new EachControl(element, compiled, keyExpression);
                addToTree(control);
                eachControls.push(control);
            }
        });

        eachControls.forEach(function (control) {
            Array.prototype.forEach.call(control.element.children, function (node) {
                control.template.appendChild(node);
            });
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
