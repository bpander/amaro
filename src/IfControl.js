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
        var ref = null;
        while ((sibling = this.nextSiblings[++i]) !== undefined) {
            if (sibling.parentNode === this.parentNode) {
                ref = sibling;
                break;
            }
        }
        if (!this.element.hasAttribute('data-animate')) {
            this.parentNode.insertBefore(this.element, ref);
            return;
        }
        // TODO: This needs some cleaning up
        var classList = this.element.classList;
        classList.remove('-enter-active');
        classList.add('-enter');
        this.parentNode.insertBefore(this.element, ref);
        var transitionDuration = Math.max.apply(null, getComputedStyle(this.element).transitionDuration.split(/,\s?/).map(parseFloat)) * 1000;
        classList.add('-enter-active');
        setTimeout(function () {
            classList.remove('-enter', '-enter-active');
        }.bind(this), transitionDuration);
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
