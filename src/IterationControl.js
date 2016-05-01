define(['Animator', 'Control'], function (Animator, Control) {
    'use strict';


    function IterationControl (element) {
        Control.call(this, element);

        this.childNodes = Array.prototype.slice.call(element.childNodes);

        this.childElements = Array.prototype.slice.call(element.children);

        this.index = -1;

        this.willDestroy = false;

    }
    IterationControl.prototype = Object.create(Control.prototype);
    var proto = IterationControl.prototype;
    proto.constructor = IterationControl;


    proto.enter = function () {
        var type = (this.parent.isMounted) ? Animator.TYPE.ENTER : Animator.TYPE.APPEAR;
        return this.animator.animate(this.childElements, type);
    }


    proto.leave = function () {
        if (!this.isMounted) {
            return null;
        }
        var promise = this.animator.animate(this.childElements, Animator.TYPE.LEAVE);
        var onFulfilled = function () {
            this.childNodes.forEach(function (node) {
                node.parentNode.removeChild(node);
            });
        }.bind(this);
        if (promise === null) {
            onFulfilled();
        } else {
            promise.then(onFulfilled);
        }
        return promise;
    };


    return IterationControl;
});
