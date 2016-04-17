define(function (require) {
    'use strict';

    var AnimationQueue = require('./AnimationQueue');
    var Control = require('./Control');
    var Util = require('./Util');


    function IfControl (element) {
        Control.call(this, element);

        this.parentNode = element.parentNode;

        this.nextSiblings = Util.getNextSiblings(element);

        this.isAttached = true;

        this.isMounted = false;

        this.animationQueue = new AnimationQueue();

    }
    IfControl.prototype = Object.create(Control.prototype);
    IfControl.prototype.constructor = IfControl;


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
        var insertFn = function () {
            this.parentNode.insertBefore(this.element, ref);
        }.bind(this);
        if (!this.element.hasAttribute('data-animate')) {
            insertFn();
            return;
        }
        this.animationQueue.jumpToEnd().add(this.element, insertFn);
    };


    IfControl.prototype.detach = function () {
        if (!this.isAttached) {
            return;
        }
        this.isAttached = false;
        var removeFn = function () {
            this.parentNode = this.element.parentNode;
            this.nextSiblings = Util.getNextSiblings(this.element);
            this.parentNode.removeChild(this.element);
        }.bind(this);
        if (!this.element.hasAttribute('data-animate') || !this.isMounted) {
            removeFn();
            return;
        }
        this.animationQueue.jumpToEnd().remove(this.element, removeFn);
    };


    return IfControl;
});
