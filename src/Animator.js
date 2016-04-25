define(function (require) {
    'use strict';

    var Deferred = require('./Deferred');
    var Util = require('./Util');


    function Animator () {

        this.enabled = false;

        this.prefix = '';

        this.animation = new Deferred();

    }
    var proto = Animator.prototype;


    Animator.TYPE = {
        APPEAR: '-appear',
        ENTER:  '-enter',
        LEAVE:  '-leave'
    };


    proto.enable = function () {
        this.enabled = true;
    };


    proto.animate = function (elements, type) {
        if (!this.enabled) {
            return Promise.resolve();
        }
        var initialClass = this.prefix + type;
        var activeClass = initialClass + '-active';
        var always = function () {
            elements.forEach(function (element) {
                element.classList.remove(initialClass, activeClass);
            });
        };
        var transitionTime;
        this.animation.reject();
        this.animation = new Deferred();
        this.animation.promise.then(always, always);

        elements.forEach(function (element) {
            element.classList.add(initialClass);
            Util.forceRedraw(element);
        });
        transitionTime = Math.max.apply(null, elements.map(Util.getTotalTransitionTime));
        if (transitionTime === 0) {
            this.animation.resolve();
            return this.animation.promise;
        }
        elements.forEach(function (element) {
            element.classList.add(activeClass);
        });
        setTimeout(this.animation.resolve, transitionTime);
        return this.animation.promise;
    };


    return Animator;
});
