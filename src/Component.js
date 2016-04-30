define(['Control', 'Util'], function (Control, Util) {
    'use strict';


    function Component (element) {
        Control.call(this, element);

        this.state = Util.deepCopy(this.constructor.defaults || {});

        this.prevState = Util.deepCopy(this.state);

    }
    Component.prototype = Object.create(Control.prototype);
    var proto = Component.prototype;
    proto.constructor = Component;


    Component.defaults = {};


    proto.acceptState = function (state, loop, thisArg) {
        this.setState(this.expression.call(thisArg, state, loop), loop);
    };


    proto.setState = function (state, loop) {
        var i;
        var l;
        var prevState = this.prevState;
        var nextState = Object.assign(this.state, state);
        var shouldComponentUpdate = (this.isMounted) ? this.shouldComponentUpdate(nextState) : true;
        var isMounted = this.isMounted;
        this.prevState = Util.deepCopy(this.state);
        if (shouldComponentUpdate === false) {
            return;
        }

        (isMounted) ? this.componentWillUpdate(nextState) : this.componentWillMount();
        for (i = 0, l = this.children.length; i < l; i++) {
            this.children[i].acceptState(nextState, loop, this);
        }
        this.isMounted = true;
        (isMounted) ? this.componentDidUpdate(prevState) : this.componentDidMount();
    };


    proto.unmount = function () {
        Control.prototype.unmount.call(this);
        this.componentWillUnmount();
    };


    proto.componentWillMount = function () {
    };


    proto.componentDidMount = function () {
    };


    proto.shouldComponentUpdate = function (nextState) {
        return true;
    };


    proto.componentWillUpdate = function (nextState) {
    };


    proto.componentDidUpdate = function (prevState) {
    };


    proto.componentWillUnmount = function () {
    };


    return Component;
});
