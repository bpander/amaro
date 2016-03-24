define(function (require) {
    'use strict';

    var IfComponent = require('./IfComponent');


    var Lib = {};


    Lib.mount = function (element, Component, initialState) {
        var component = new Component(element, initialState);
        var ifElements = element.querySelectorAll('[data-if]');
        var ifComponents = Array.prototype.map.call(ifElements, function (ifElement) {
            return new IfComponent(ifElement);
        });
        ifComponents.forEach(function (ifComponent, i) {
            var counter;
            var j = i;
            while (--j >= 0) {
                counter = ifComponents[j];
                if (counter.element.contains(ifComponent.element)) {
                    counter.childComponents.push(ifComponent);
                    return;
                }
            }
            component.childComponents.push(ifComponent);
        });
        component.setState();
        return component;
    };


    return Lib;
});
