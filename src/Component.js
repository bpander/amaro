define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function Component (element) {
        Control.call(this, element);

        this.state = Util.deepCopy(this.constructor.defaults);

        this.isMounted = false;

    }
    Component.prototype = Object.create(Control.prototype);
    Component.prototype.constructor = Component;


    Component.defaults = {};


    Component.prototype.acceptState = function (state, loop, thisArg) {
        this.setState(this.expression.call(thisArg, state, loop), loop);
    };


    Component.prototype.setState = function (state, loop) {
        var i;
        var l;
        Object.assign(this.state, state);
        (this.isMounted) ? this.componentWillUpdate() : this.componentWillMount();
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(this.state, loop, this);
        }
        if (this.isMounted) {
            this.componentDidUpdate();
        } else {
            this.isMounted = true;
            this.componentDidMount();
        }
    };


    Component.prototype.componentWillMount = function () {
    };


    Component.prototype.componentDidMount = function () {
    };


    Component.prototype.componentWillUpdate = function () {
    };


    Component.prototype.componentDidUpdate = function () {
    };


    Component.prototype.componentWillUnmount = function () {
    };


    return Component;
});
