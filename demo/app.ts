import 'jquery/dist/jquery.js';
import "bootstrap/dist/js/bootstrap.js";
import * as angular from "angular";
import * as moment from "moment";

require("bootstrap/dist/css/bootstrap.css");
// require("../dist/calendar.css")
// import "../dist/calendar.js";
import "../src/calendar/calendar.directive";
// import "angular-bootstrap-calendar";


let app = angular.module("app", ['calendarApp']);

app.controller("testCtrl", function($scope, $q, $timeout) {
    var vm = this;

    $scope.calendarId = "asdf";

    vm.onDateSelect = function(date, id) {
        console.log('Date selected:', date, id);
    }

    vm.monthChanged = function(month) {
        console.log('month:', month);
    }

    vm.daysContainingEvents = function() {
        console.log('called days containing events');
        let defer = $q.defer();   
        let events = [];

        for(let i = 0; i < 100; i++) {
            events.push(moment().startOf("year").add(Math.ceil(Math.random() * 365), 'day').format("DD/MM"));
        }

        $timeout(() => {
            defer.resolve(events);
        }, 1000);

        return defer.promise;
    }

    vm.getEvents = function(date) {
        let defer = $q.defer();
        let events = [
            {
                fromTime: '11:20 AM',
                toTime: '11:30 AM',
                description: 'Class1Class1Class1Class1Class1Class1Class1Cla ss1Class1Class1Class1Class1Class1Class1Class1Class1C  lass1Class1Class1Class1Class1Class1Class1Class1Class 1Class1Class1Class1Class1Class1Class1Class1Cl aSDFFFFFFFFFFFFFFFFFFFFFFFFFFFFF ASSSSSSSSS ASSSSSSSSS aSDFFFFFFFFFFFFFFFFFFFFFFFFFFFFF ASSSSSSSSS ASSSSSSSSS aSDFFFFFFFFFFFFFFFFFFFFFFFFFFFFF ASSSSSSSSS ASSSSSSSSS'
            }, {
                fromTime: '10:20 AM',
                toTime: '11:30 AM',
                description: 'Class2'
            }
        ]

        if(true) {
        // if(Math.round(Math.random())) {
            $timeout(() => {
                defer.resolve(events);
            }, 1000)
        } else {
            $timeout(() => {
                defer.reject();
            }, 0)
        }

        return defer.promise;
    }

    vm.removeEvent = function (date, event) {
        console.log('Event Removal:', date, event);
        var defer = $q.defer();

        if(Math.round(Math.random())) {
            $timeout(() => {
                defer.resolve();
            }, 1000)
        } else {
            $timeout(() => {
                defer.reject();
            }, 100)
        }

        return defer.promise;
    }

    vm.updateEvent = function(date, event) {
        console.log('Event update:', date, event);
        var defer = $q.defer();

        if(Math.round(Math.random())) {
            $timeout(() => {
                defer.resolve();
            }, 1000)
        } else {
            $timeout(() => {
                defer.reject();
            }, 100)
        }

        return defer.promise;
    }
    vm.saveEvent = function(date, event) {
        console.log('Event save:', date, event);
        var defer = $q.defer();

        event.id = 1;
        // if(Math.round(Math.random())) {
            $timeout(() => {
                defer.resolve(event);
            }, 1000)
        // } else {
        //     $timeout(() => {
        //         defer.reject();
        //     }, 100)
        // }

        return defer.promise;
    }
})