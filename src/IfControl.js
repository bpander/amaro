define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function IfControl (element) {
        Control.call(this, element);

        this.parentNode = null;

        this.nextSiblings = Util.getNextSiblings(this.element);

        this.isAttached = true;

    }
    IfControl.prototype = Object.create(Control.prototype);
    var proto = IfControl.prototype;
    proto.constructor = IfControl;


    proto.acceptState = function (state, loop, thisArg) {
        if (this.expression.call(thisArg, state, loop)) {
            this.attach();
            Control.prototype.acceptState.call(this, state, loop);
        } else {
            this.detach();
        }
        this.isMounted = true;
    };


    proto.attach = function () {
        if (this.isAttached) {
            return;
        }
        this.isAttached = true;
        if (!document.body.contains(this.element)) {
            this.parentNode.insertBefore(this.element, this.getReferenceNode());
        }
        this.enter();
    };


    proto.getReferenceNode = function () {
        var i = -1;
        var sibling;
        var ref = null;
        while ((sibling = this.nextSiblings[++i]) !== undefined) {
            if (sibling.parentNode === this.parentNode) {
                ref = sibling;
                break;
            }
        }
        return ref;
    }


    proto.detach = function () {
        if (!this.isAttached) {
            return;
        }
        this.isAttached = false;
        this.leave();
    };


    proto.leave = function () {
        var promise = Control.prototype.leave.call(this);
        promise.then(function () {
            this.parentNode = this.element.parentNode;
            this.parentNode.removeChild(this.element);
        }.bind(this));
        return promise;
    };


    return IfControl;
});
