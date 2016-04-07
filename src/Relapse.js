define(function (require) {
    'use strict';

    // TODO: Rewrite this using ES2015 syntax + Babel transpiler
    // TODO: Make a router demo
    // TODO: Figure out if there's a way to "precompile" the markup

    var Component = require('./Component');
    var IfControl = require('./IfControl');
    var EachControl = require('./EachControl');
    var OutputControl = require('./OutputControl');


    var Relapse = {};


    Relapse.componentMap = {};


    Relapse.mount = function (element, T, initialState) {
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
                compiled = Relapse.compileExpression(ifExpr);
                addToTree(new IfControl(element, compiled));
            }
            if (outExpr !== undefined) {
                compiled = Relapse.compileExpression(outExpr);
                addToTree(new OutputControl(element, compiled));
            }
            if (componentExpr !== undefined) {
                // TODO: Think of a better way to do get the ComponentConstructor
                var ComponentConstructor = Relapse.componentMap[componentExpr];
                compiled = Relapse.compileExpression(element.dataset.state);
                addToTree(new ComponentConstructor(element, compiled));
            }
            if (eachExpr !== undefined) {
                var control;
                var keyExpression = Relapse.compileExpression(element.dataset.key);
                compiled = Relapse.compileExpression(eachExpr);
                control = new EachControl(element, compiled, keyExpression);
                addToTree(control);
                eachControls.push(control);
            }
        });

        // TODO: This is super unclear and needs to be cleaned up. Also 86 the forEach calls.
        eachControls.forEach(function (control) {
            Array.prototype.forEach.call(control.element.children, function (node) {
                control.template.appendChild(node);
            });
        });

        rootComponent.setState(initialState);

        return rootComponent;
    };


    Relapse.compileExpression = function (expression) {
        // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
        return new Function('state, loop', 'return ' + expression + ';');
    };


    return Relapse;
});
