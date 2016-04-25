define(function (require) {
    'use strict';

    var Animator = require('./Animator');
    var Control = require('./Control');


    function IterationControl (element) {
        Control.call(this, element);

        this.childNodes = Array.prototype.slice.call(element.childNodes, 0);

        this.index = -1;

    }
    IterationControl.prototype = Object.create(Control.prototype);
    var proto = IterationControl.prototype;
    proto.constructor = IterationControl;


    proto.enter = function () {
        var type = (this.parent.isMounted) ? Animator.TYPE.ENTER : Animator.TYPE.APPEAR;
        return this.animator.animate(this.childNodes, type);
    }


    proto.leave = function () {
        if (!this.isMounted) {
            return Promise.resolve();
        }
        var promise = this.animator.animate(this.childNodes, Animator.TYPE.LEAVE);
        promise.then(function () {
            this.childNodes.forEach(function (node) {
                node.parentNode.removeChild(node);
            });
        }.bind(this));
        return promise;
    };


    return IterationControl;
});
