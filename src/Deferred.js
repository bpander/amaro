define(function (require) {
    'use strict';


    function Deferred () {

        this.promise = new Promise(function (resolve, reject) {

            this.resolve = resolve;

            this.reject = reject;

        }.bind(this));

    }


    return Deferred;
});
