define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function Component (element, expression) {
        Control.call(this, element, expression);

        this.state = Util.deepCopy(this.constructor.defaults);

    }
    Component.prototype = Object.create(Control.prototype);
    Component.prototype.constructor = Component;


    Component.defaults = {};


    Component.prototype.controlWillMount = function () {
        Control.prototype.controlWillMount.call(this);
        this.componentWillMount();
    };


    Component.prototype.controlDidMount = function () {
        Control.prototype.controlDidMount.call(this);
        this.componentDidMount();
    };


    Component.prototype.acceptState = function (state, loop, thisArg) {
        this.setState(this.expression.call(thisArg, state, loop), loop);
    };


    Component.prototype.setState = function (state, loop) {
        var i;
        var l;
        Object.assign(this.state, state);
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(this.state, loop, this);
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
