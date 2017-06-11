"use strict";
require("jquery");
require("bootstrap/dist/js/bootstrap.js");
var angular = require("angular");
var moment = require("moment");
require("bootstrap-timepicker/js/bootstrap-timepicker.js");
require("bootstrap-timepicker/css/bootstrap-timepicker.css");
require("./calendar.css");
var app;
(function (app) {
    var calendar;
    (function (calendar) {
        ;
        var CalendarCtrl = (function () {
            function CalendarCtrl($scope) {
                this.$scope = $scope;
                this.startOfAcademicYear = 'Jun';
                this.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                this.dates = [];
                this.selectedDate = moment().toDate();
                this.eventDates = [];
                this.todaysEvents = [];
                this.addEvent = true;
                this.modalEventIndex = 0;
                this.currYear = moment().format('YYYY');
                this.currMonth = moment().format("YYYY/MM");
                this.normalMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                this.academicMonths = [];
                this.init();
            }
            /**
             * Converts the full Label of the week to required format(Ex: S|Sun|Sunday)
             * @param day
             * @returns {string} Formatted label
             */
            CalendarCtrl.prototype.getDayLabel = function (day) {
                switch (this.$scope.dayLabelFormat) {
                    case 's': return day[0];
                    case 'l': return day;
                    default: return day.slice(0, 3);
                }
            };
            /**
             * Checks if the date belongs the Selected month or not --> to highlight of mute the dates accordingly
             * @param date
             * @returns {boolean}
             */
            CalendarCtrl.prototype.isSelectedMonth = function (date) {
                return moment(date).format("YYYY/MM") == this.currMonth;
            };
            /**
             * Checks if there is any Event available for the given date
             * @param date
             * @returns {boolean}
             */
            CalendarCtrl.prototype.isEventsAvailable = function (date) {
                if (this.isSelectedMonth(date)) {
                    return this.eventDates.some(function (eDate) {
                        return eDate == moment(date).format("MM/DD");
                    });
                }
                else {
                    return false;
                }
            };
            /**
             * Will be called on selection of a particular date
             * @param date
             */
            CalendarCtrl.prototype.dateSelected = function (date) {
                this.selectedDate = date;
                this.todaysEvents = [];
                if (this.$scope.onDateSelect) {
                    var self_1 = this;
                    this.$scope.onDateSelect({ date: date, id: self_1.calendarId });
                }
                this.getEvents(date);
            };
            /**
             * Returns all the Events corresponding to selected Date
             * @param date
             * @returns {IEvents[]}
             */
            CalendarCtrl.prototype.getEvents = function (date) {
                var _this = this;
                var self = this;
                this.$scope.eventSource({ date: date, id: self.calendarId }).then(function (events) {
                    events.sort(function (a, b) {
                        if (moment(a.fromTime, "h:mm A") > moment(b.fromTime, "h:mm A"))
                            return 1;
                        else
                            return -1;
                    });
                    _this.todaysEvents = events;
                }, function () {
                    _this.todaysEvents = [];
                });
                // return [];
            };
            /**
             * Returns all the dates of a month that has Events associated with them
             * @param month
             * @returns {number[]}
             */
            CalendarCtrl.prototype.getDaysContainingEvents = function () {
                var _this = this;
                var self = this;
                this.$scope.daysContainingEvents({ id: self.calendarId }).then(function (dates) {
                    _this.eventDates = dates;
                }, function () {
                    _this.eventDates = [];
                });
            };
            /**
             * Will be called when Prev month is clicked
             * This changes to prev month
             */
            CalendarCtrl.prototype.prevMonth = function () {
                var prevMonth = moment(this.currMonth, 'YYYY/MM').add(-1, 'month').format("YYYY/MM");
                if (prevMonth >= this.academicMonths[0]) {
                    this.currMonth = prevMonth;
                    this.getDates();
                    this.monthChanged();
                }
            };
            /**
             * Will be called when Next month is clicked
             * This changes to next month
             */
            CalendarCtrl.prototype.nextMonth = function () {
                var nextMonth = moment(this.currMonth, 'YYYY/MM').add(1, 'month').format("YYYY/MM");
                if (nextMonth <= this.academicMonths[this.academicMonths.length - 1]) {
                    this.currMonth = nextMonth;
                    // this.calendarLabel = moment(nextMonth, "YYYY/MM").format("MMM YYYY");
                    this.getDates();
                    this.monthChanged();
                }
            };
            /**
             * @private
             * Called initially
             */
            CalendarCtrl.prototype.init = function () {
                var self = this;
                this.calendarId = this.$scope.calendarId || 'idNotPresent';
                this.calendarEventModalId = 'calendarEventModal_' + this.calendarId;
                this.startOfAcademicYear = (this.$scope.startOfAcademicYear || this.startOfAcademicYear);
                if (this.$scope.academicYear) {
                    this.academicYear = this.$scope.academicYear;
                    this.currMonth = moment(this.academicYear.split("-")[0] + this.startOfAcademicYear, "YYYYMMM").format("YYYY/MM");
                    this.currYear = this.academicYear.split("-")[0];
                }
                else {
                    var currMonth = moment().format("MMM");
                    var academicYears = [];
                    if (this.normalMonths.indexOf(currMonth) >= this.normalMonths.indexOf(this.startOfAcademicYear)) {
                        academicYears = [moment().format("YYYY"), moment().add(1, 'year').format("YYYY")];
                    }
                    else {
                        academicYears = [moment().add(-1, 'year').format("YYYY"), moment().format("YYYY")];
                    }
                    this.academicYear = academicYears.join("-");
                    this.currYear = academicYears[0];
                }
                this.getDates();
                this.getDaysContainingEvents();
                this.dateSelected(moment(this.currYear + this.startOfAcademicYear, "YYYYMMM").toDate());
                var tpOptions = {
                    minuteStep: 15,
                    showSeconds: false,
                    showMeridian: true
                };
                this.eventFromTimeId = "event_from_time_" + this.calendarId;
                this.eventToTimeId = "event_to_time_" + this.calendarId;
                $("#" + self.eventFromTimeId).timepicker(tpOptions);
                $("#" + self.eventToTimeId).timepicker(tpOptions);
                for (var i = 0; i < 12; i++) {
                    this.academicMonths.push(moment(this.currYear, 'YYYY').month(this.startOfAcademicYear).add(i, 'month').format("YYYY/MM"));
                }
                this.enableAddEvents = this.$scope.enableAddEvents != undefined ? this.$scope.enableAddEvents : true;
                this.enableEditEvents = this.$scope.enableEditEvents != undefined ? this.$scope.enableEditEvents : true;
                this.enableDelEvents = this.$scope.enableDelEvents != undefined ? this.$scope.enableDelEvents : true;
            };
            /**
             * @private
             * Will be called when 'Save' button is clicked in the Add Event modal
             * This will create a new event for the selected date
             */
            CalendarCtrl.prototype.saveEvent = function () {
                var _this = this;
                var self = this;
                this.$scope.onSaveEvent({ date: this.selectedDate, event: this.modalEvent, id: self.calendarId }).then(function (event) {
                    _this.todaysEvents.push(event);
                    $("#" + self.calendarEventModalId).modal("hide");
                }, function () {
                    console.error("Failed to Save Event");
                    $("#" + self.calendarEventModalId).modal("hide");
                });
            };
            /**
             * @private
             * Will be called when 'Update' button is clicked in the Edit Event modal
             * this will update the event in the selected date
             */
            CalendarCtrl.prototype.updateEvent = function () {
                var _this = this;
                var self = this;
                this.$scope.onUpdateEvent({ date: this.selectedDate, event: this.modalEvent, id: self.calendarId }).then(function () {
                    _this.todaysEvents[_this.modalEventIndex] = _this.modalEvent;
                    $("#" + self.calendarEventModalId).modal("hide");
                }, function () {
                    console.error("Failed to Update Event");
                    $("#" + self.calendarEventModalId).modal("hide");
                });
            };
            /**
             * @private
             * Will be called when remove event is clicked
             * Removes the Event from the selected Date
             * @param event
             */
            CalendarCtrl.prototype.removeEvent = function (index) {
                var _this = this;
                var self = this;
                this.$scope.onRemoveEvent({ date: this.selectedDate, event: this.todaysEvents[index], id: self.calendarId }).then(function () {
                    _this.todaysEvents.splice(index, 1);
                }, function () {
                    console.error("Failed to Remove Event");
                });
            };
            /**
             * @private
             * Will be called when the Selected Month Changes
             */
            CalendarCtrl.prototype.monthChanged = function () {
                if (this.$scope.monthChanged) {
                    var self_2 = this;
                    this.$scope.monthChanged({ month: this.currMonth, id: self_2.calendarId });
                }
            };
            /**
             * @private
             * Will be called when Add Event button is clicked
             * This will initialise the Event data binding to default values
             */
            CalendarCtrl.prototype.addEventModal = function () {
                this.addEvent = true;
                this.modalEvent = {
                    fromTime: moment().format("h:mm A"),
                    toTime: moment().format("h:mm A"),
                    description: ""
                };
                var self = this;
                $("#" + self.calendarEventModalId).modal("show");
            };
            /**
             * @private
             * Will be called when Edit Event button is clicked
             * This will initialise the Event data binding to selected Event values
             */
            CalendarCtrl.prototype.editEventModal = function (event, index) {
                if (this.enableEditEvents) {
                    this.addEvent = false;
                    this.modalEventIndex = index;
                    this.modalEvent = Object.assign({}, event);
                    var self_3 = this;
                    $("#" + self_3.calendarEventModalId).modal("show");
                }
            };
            /**
             * @private
             * Get All the dates in the Selected Month
             */
            CalendarCtrl.prototype.getDates = function () {
                var dates = [];
                var givenMonth = moment(this.currMonth, 'YYYY/MM');
                var startWeek = givenMonth.startOf("month").week(); // Get all the Weeks in a month
                var endWeek = startWeek + 5; // Get end week +5(Such that error is alleviated)
                if (startWeek > endWeek) {
                    endWeek = givenMonth.isoWeeksInYear() + 1;
                }
                for (var i = startWeek; i <= endWeek; i++) {
                    for (var j = 0; j < 7; j++) {
                        dates.push(moment(this.currMonth, 'YYYY/MM').week(i).isoWeekday(j).toDate());
                    }
                }
                this.dates = dates;
            };
            return CalendarCtrl;
        }());
        CalendarCtrl.$inject = ['$scope'];
        var CalendarDirective = (function () {
            function CalendarDirective() {
                this.restrict = 'E';
                this.template = require("./calendar.template.html");
                this.controller = CalendarCtrl;
                this.controllerAs = 'vm';
                this.scope = {
                    calendarId: '=',
                    enableAddEvents: '=',
                    enableEditEvents: '=',
                    enableDelEvents: '=',
                    onDateSelect: '&',
                    startOfAcademicYear: '=',
                    academicYear: '=',
                    dayLabelFormat: '@',
                    monthChanged: '&onMonthChange',
                    daysContainingEvents: '&',
                    eventSource: '&',
                    onRemoveEvent: '&',
                    onUpdateEvent: '&',
                    onSaveEvent: '&'
                };
            }
            return CalendarDirective;
        }());
        calendar.CalendarDirective = CalendarDirective;
        angular.module("calendarApp", [])
            .directive("calendar", function () { return new CalendarDirective(); })
            .filter('ngDate', function () {
            return function (date, inFormat, outFormat) {
                if (outFormat) {
                    return moment(date, inFormat).format(outFormat);
                }
                return moment(date).format(inFormat);
            };
        });
    })(calendar = app.calendar || (app.calendar = {}));
})(app || (app = {}));
