define([
    'Component',
    'IfControl',
    'EachControl',
    'OutputControl'
], function (
    Component,
    IfControl,
    EachControl,
    OutputControl
) {
    'use strict';

    // TODO: Make a router demo

    var Amaro = {};


    Amaro.Component = Component;


    Amaro._componentMap = {};


    Amaro.components = function (componentMap) {
        Object.assign(Amaro._componentMap, componentMap);
    };


    Amaro.processElement = function (element, rootComponent) {
        var ifExpr = element.getAttribute('data-if');
        var outExpr = element.getAttribute('data-out');
        var componentExpr = element.getAttribute('data-component');
        var eachExpr = element.getAttribute('data-each');
        var control;
        var animatorPrefix;

        if (ifExpr !== null) {
            control = new IfControl(element);
            control.expression = Amaro.compileExpression(ifExpr);
            animatorPrefix = element.getAttribute('data-animate');
            if (animatorPrefix !== null) {
                control.animator.prefix = animatorPrefix;
                control.animator.enable();
            }
            rootComponent.addToTree(control);
        }
        if (outExpr !== null) {
            control = new OutputControl(element);
            control.expression = Amaro.compileExpression(outExpr);
            rootComponent.addToTree(control);
        }
        if (componentExpr !== null) {
            // TODO: Think of a better way to do get the ComponentConstructor
            var ComponentConstructor = Amaro._componentMap[componentExpr];
            control = new ComponentConstructor(element);
            control.expression = Amaro.compileExpression(element.getAttribute('data-state'));
            rootComponent.addToTree(control);
        }
        if (eachExpr !== null) {
            control = new EachControl(element);
            control.expression = Amaro.compileExpression(eachExpr);
            control.keyExpression = Amaro.compileExpression(element.getAttribute('data-key') || Amaro.defaultKeyExpression);
            animatorPrefix = element.getAttribute('data-animate-each');
            if (animatorPrefix !== null) {
                control.animator.prefix = animatorPrefix;
                control.animator.enable();
            }
            rootComponent.addToTree(control);
        }
    };


    Amaro.mount = function (element, T, initialState) {
        var rootComponent = new T(element);
        var elements = element.querySelectorAll('[data-if], [data-out], [data-component], [data-each]');
        var i;
        var l;
        for (i = 0, l = elements.length; i < l; i++) {
            Amaro.processElement(elements[i], rootComponent);
        }

        rootComponent.controlDidParse();
        rootComponent.acceptState(initialState);

        return rootComponent;
    };


    Amaro.compileExpression = function (expression) {
        // comma-separated argument definition seems to be a little faster than the `new Function(arg1, arg2, body)` way
        return new Function('state, loop', 'return ' + expression + ';');
    };


    Amaro.defaultKeyExpression = 'loop.key';


    return Amaro;
});
