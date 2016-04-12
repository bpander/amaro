define(function (require) {
    'use strict';

    // TODO: Rewrite this using ES2015 syntax + Babel transpiler
    // TODO: Make a router demo
    // TODO: Figure out if there's a way to "precompile" the markup
    // TODO: Use `var proto` because performance

    var Component = require('./Component');
    var IfControl = require('./IfControl');
    var EachControl = require('./EachControl');
    var OutputControl = require('./OutputControl');


    var Relapse = {};


    Relapse.componentMap = {};


    Relapse.processElement = function (element, rootComponent) {
        var ifExpr = element.getAttribute('data-if');
        var outExpr = element.getAttribute('data-out');
        var componentExpr = element.getAttribute('data-component');
        var eachExpr = element.getAttribute('data-each');

        if (ifExpr !== null) {
            var compiled = Relapse.compileExpression(ifExpr);
            rootComponent.addToTree(new IfControl(element, compiled));
        }
        if (outExpr !== null) {
            var compiled = Relapse.compileExpression(outExpr);
            rootComponent.addToTree(new OutputControl(element, compiled));
        }
        if (componentExpr !== null) {
            // TODO: Think of a better way to do get the ComponentConstructor
            var ComponentConstructor = Relapse.componentMap[componentExpr];
            var compiled = Relapse.compileExpression(element.getAttribute('data-state'));
            rootComponent.addToTree(new ComponentConstructor(element, compiled));
        }
        if (eachExpr !== null) {
            var keyExpression = Relapse.compileExpression(element.getAttribute('data-key') || Relapse.defaultKeyExpression);
            var compiled = Relapse.compileExpression(eachExpr);
            var control = new EachControl(element, compiled, keyExpression);
            rootComponent.addToTree(control);
        }
    };


    Relapse.mount = function (element, T, initialState) {
        var rootComponent = new T(element);
        var elements = element.querySelectorAll('[data-if], [data-out], [data-component], [data-each]');
        var i;
        var l;
        for (i = 0, l = elements.length; i < l; i++) {
            Relapse.processElement(elements[i], rootComponent);
        }

        rootComponent.controlDidMount();
        rootComponent.setState(initialState);

        return rootComponent;
    };


    Relapse.compileExpression = function (expression) {
        // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
        return new Function('state, loop', 'return ' + expression + ';');
    };


    Relapse.defaultKeyExpression = 'loop.key';


    return Relapse;
});
