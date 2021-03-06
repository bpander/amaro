define(function (require) {
    'use strict';

    var Component = require('../../Amaro').Component;


    function TodoApp (element, expression) {
        Component.call(this, element, expression);
    }
    TodoApp.prototype = Object.create(Component.prototype);
    TodoApp.prototype.constructor = TodoApp;


    var _id = 3;


    TodoApp.defaults = {
        todos: [],
        onkeydown: function (e) {
            if (e.keyCode === 13 && e.target.value.trim() !== '') {
                this.state.todos.push({ text: e.target.value, id: _id++ });
                this.setState();
                e.target.value = '';
                e.preventDefault(); // IE does some real weird stuff on enter press
            }
        },
        removeTodo: function (todo) {
            var index = this.state.todos.indexOf(todo);
            if (index === -1) {
                return;
            }
            this.state.todos.splice(index, 1);
            this.setState();
        },
        toggleTodo: function (todo) {
            todo.complete = !todo.complete;
            this.setState();
        }
    };


    TodoApp.prototype.setState = function () {
        var start = Date.now();
        Component.prototype.setState.apply(this, arguments);
        console.log('setState took', Date.now() - start, 'ms');
    };


    return TodoApp;
});
