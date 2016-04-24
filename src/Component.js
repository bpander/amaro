define(function (require) {
    'use strict';

    var Control = require('./Control');
    var Util = require('./Util');


    function Component (element) {
        Control.call(this, element);

        this.state = Util.deepCopy(this.constructor.defaults);

        this.prevState = Util.deepCopy(this.state);

    }
    Component.prototype = Object.create(Control.prototype);
    Component.prototype.constructor = Component;


    Component.defaults = {};


    Component.prototype.acceptState = function (state, loop, thisArg) {
        this.setState(this.expression.call(thisArg, state, loop), loop);
        this.isMounted = true;
    };


    Component.prototype.setState = function (state, loop) {
        var i;
        var l;
        var prevState = this.prevState;
        var nextState = Object.assign(this.state, state);
        var shouldComponentUpdate = (this.isMounted) ? this.shouldComponentUpdate(nextState) : true;
        this.prevState = Util.deepCopy(this.state);
        if (shouldComponentUpdate === false) {
            return;
        }

        (this.isMounted) ? this.componentWillUpdate(nextState) : this.componentWillMount();
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(nextState, loop, this);
        }
        (this.isMounted) ? this.componentDidUpdate(prevState) : this.componentDidMount();
    };


    Component.prototype.componentWillMount = function () {
    };


    Component.prototype.componentDidMount = function () {
    };


    Component.prototype.shouldComponentUpdate = function (nextState) {
        return true;
    };


    Component.prototype.componentWillUpdate = function (nextState) {
    };


    Component.prototype.componentDidUpdate = function (prevState) {
    };


    Component.prototype.componentWillUnmount = function () {
        // TODO: Implement
    };


    return Component;
});
