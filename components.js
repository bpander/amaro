(function () {
    'use strict';

    var State = window.State;


    function TodosApp (element, props) {
        State.Component.call(this, element, props);

    }
    TodosApp.prototype = Object.create(State.Component.prototype);
    TodosApp.prototype.constructor = TodosApp;


    State.componentMap = {
        TodosApp: TodosApp
    };
})();
