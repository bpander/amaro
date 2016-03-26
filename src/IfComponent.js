define(function (require) {
    'use strict';

    var Component = require('./Component');


    function IfComponent (element, expression) {
        Component.call(this, element);

        this.parentNode = element.parentNode;

        this.nextSiblings = IfComponent.getNextSiblings(element);

    }
    IfComponent.prototype = Object.create(Component.prototype);
    IfComponent.prototype.constructor = IfComponent;


    IfComponent.getNextSiblings = function (element) {
        var sibling = element;
        var nextSiblings = [];
        while ((sibling = sibling.nextSibling) !== null) {
            nextSiblings.push(sibling);
        }
        return nextSiblings;
    };


    IfComponent.prototype.setState = function (state) {
        var isTruthy = this.expression(state) == true;
        if (isTruthy) {
            this.parentNode.insertBefore(this.element, this.nextSiblings[0]);
            Component.prototype.setState.call(this, state);
        } else {
            if (this.element.parentNode === this.parentNode) {
                this.parentNode.removeChild(this.element);
            }
        }
    };


    return IfComponent;
});
