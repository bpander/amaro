define(function (require) {
    'use strict';

    var Control = require('./Control');


    function IfControl (element, expression) {
        Control.call(this, element, expression);

        this.parentNode = element.parentNode;

        this.nextSiblings = IfControl.getNextSiblings(element);

    }
    IfControl.prototype = Object.create(Control.prototype);
    IfControl.prototype.constructor = IfControl;


    IfControl.getNextSiblings = function (element) {
        var sibling = element;
        var nextSiblings = [];
        while ((sibling = sibling.nextSibling) !== null) {
            nextSiblings.push(sibling);
        }
        return nextSiblings;
    };


    IfControl.prototype.acceptState = function (state, loop, thisArg) {
        if (this.expression.call(thisArg, state, loop)) {
            this.attach();
            Control.prototype.acceptState.call(this, state, loop);
        } else {
            this.detach();
        }
    };


    IfControl.prototype.attach = function () {
        if (document.contains(this.element)) {
            return;
        }
        var i = -1;
        var sibling;
        while ((sibling = this.nextSiblings[++i]) !== undefined) {
            if (sibling.parentNode === this.parentNode) {
                this.parentNode.insertBefore(this.element, sibling);
                return;
            }
        }
        this.parentNode.appendChild(this.element);
    };


    IfControl.prototype.detach = function () {
        var parentNode = this.element.parentNode;
        if (parentNode === null) {
            return;
        }
        this.parentNode = parentNode;
        this.nextSiblings = IfControl.getNextSiblings(this.element);
        this.parentNode.removeChild(this.element);
    };


    return IfControl;
});
