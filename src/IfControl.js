define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function IfControl (element, expression) {
        Control.call(this, element, expression);

        this.parentNode = element.parentNode;

        this.nextSiblings = IfControl.getNextSiblings(element);

        this.isAttached = true;

        this.isMounted = false;

        this.timeoutId = -1;

        this.fn = Util.noop;

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
        this.isMounted = true;
    };


    IfControl.prototype.attach = function () {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;
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
        // TODO: Take transition-delay into account
        var classList = this.element.classList;
        classList.add('-enter');
        this.fn();
        this.parentNode.insertBefore(this.element, ref);
        var transitionDuration = Math.max.apply(null, getComputedStyle(this.element).transitionDuration.split(/,\s?/).map(parseFloat)) * 1000;
        classList.add('-enter-active');
        clearTimeout(this.timeoutId);
        this.fn = function () {
            classList.remove('-enter', '-enter-active');
            this.fn = Util.noop;
        }.bind(this);
        this.timeoutId = setTimeout(this.fn, transitionDuration);
    };


    IfControl.prototype.detach = function () {
        if (!this.isAttached) {
            return;
        }
        this.isAttached = false;
        // TODO: Clean this up
        if (!this.element.hasAttribute('data-animate') || !this.isMounted) {
            this.parentNode = this.element.parentNode;
            this.nextSiblings = IfControl.getNextSiblings(this.element);
            this.parentNode.removeChild(this.element);
            return;
        }
        var classList = this.element.classList;
        classList.add('-leave');
        var transitionDuration = Math.max.apply(null, getComputedStyle(this.element).transitionDuration.split(/,\s?/).map(parseFloat)) * 1000;
        classList.add('-leave-active');
        clearTimeout(this.timeoutId);
        this.fn();
        this.fn = function () {
            this.parentNode = this.element.parentNode;
            this.nextSiblings = IfControl.getNextSiblings(this.element);
            this.parentNode.removeChild(this.element);
            classList.remove('-leave', '-leave-active');
            this.fn = Util.noop;
        }.bind(this);
        this.timeoutId = setTimeout(this.fn, transitionDuration);
    };


    return IfControl;
});
