import 'jquery';
import "bootstrap/dist/js/bootstrap.js"
import * as angular from "angular";
import * as moment from 'moment';
import "bootstrap-timepicker/js/bootstrap-timepicker.js"

require("bootstrap-timepicker/css/bootstrap-timepicker.css");
require("./calendar.css");

module app.calendar {

    interface IEvent {
        fromTime: string;
        toTime: string;
        description: string;
        _id?: string;
    }

    interface IEventProvider {
        date?: Date;
        event?: IEvent;
        id: string;
    }

    type Week = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';

    interface ICalendarProvider {
        // Properties
        startOfAcademicYear: Month;
        weekDays: Week[];
        dates: Date[];
        selectedMonth: Month;
        selectedDate: Date;
        eventDates: string[];
        todaysEvents: IEvent[];
        addEvent: boolean;
        modalEvent: IEvent;
        modalEventIndex: number;

        // Methods
        getDayLabel(day: Week): string;
        isSelectedMonth(date: Date): boolean;
        isEventsAvailable(date: Date): boolean;
        dateSelected(date: Date): void;
        getEvents(date: Date): void;
        getDaysContainingEvents(): void;
        prevMonth(): void;
        nextMonth(): void;
    }

    interface ICalendarScope extends ng.IScope {
        calendarId?: string;
        enableAddEvents?: boolean;
        enableEditEvents?: boolean;
        enableDelEvents?: boolean;
        dayLabelFormat?: string;
        startOfAcademicYear?: Month;
        academicYear?: string;
        onDateSelect?(date): void;
        monthChanged?(IEventProvider): void,
        eventSource?(IEventProvider): ng.IPromise<any>,
        daysContainingEvents(IEventProvider): ng.IPromise<any>,
        onRemoveEvent?(IEventProvider): ng.IPromise<any>,
        onUpdateEvent?(IEventProvider): ng.IPromise<any>,
        onSaveEvent?(IEventProvider): ng.IPromise<any>
    };


    class CalendarCtrl implements ICalendarProvider {
        private calendarId: string;
        public startOfAcademicYear: Month = 'Jun';
        public weekDays: Week[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        public dates = [];
        public selectedMonth;
        public selectedDate = moment().toDate();
        public eventDates = [];
        public todaysEvents = [];
        public addEvent = true;
        public modalEvent: IEvent;
        public modalEventIndex = 0;
        private currYear = moment().format('YYYY');
        private currMonth = moment().format("YYYY/MM");
        private normalMonths: Month[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        private academicMonths: string[] = [];
        private academicYear: string;
        private calendarEventModalId: string;
        private eventFromTimeId: string;
        private eventToTimeId: string;
        private enableAddEvents: boolean;
        private enableEditEvents: boolean;
        private enableDelEvents: boolean;

        static $inject = ['$scope'];
        constructor(private $scope: ICalendarScope) {
            this.init();

        }

        /**
         * Converts the full Label of the week to required format(Ex: S|Sun|Sunday)
         * @param day 
         * @returns {string} Formatted label
         */
        public getDayLabel(day: Week): string {
            switch (this.$scope.dayLabelFormat) {
                case 's': return day[0];
                case 'l': return day;
                default: return day.slice(0, 3);
            }
        }

        /**
         * Checks if the date belongs the Selected month or not --> to highlight of mute the dates accordingly
         * @param date 
         * @returns {boolean}
         */
        public isSelectedMonth(date: Date): boolean {
            return moment(date).format("YYYY/MM") == this.currMonth;
        }

        /**
         * Checks if there is any Event available for the given date
         * @param date 
         * @returns {boolean}
         */
        public isEventsAvailable(date: Date): boolean {
            if (this.isSelectedMonth(date)) {
                return this.eventDates.some((eDate) => {
                    return eDate == moment(date).format("MM/DD");
                })
            } else {
                return false;
            }
        }

        /**
         * Will be called on selection of a particular date
         * @param date 
         */
        public dateSelected(date: Date): void {
            this.selectedDate = date;
            this.todaysEvents = [];

            if (this.$scope.onDateSelect) {
                let self = this;
                this.$scope.onDateSelect({ date: date, id: self.calendarId });
            }

            this.getEvents(date);
        }

        /**
         * Returns all the Events corresponding to selected Date
         * @param date 
         * @returns {IEvents[]}
         */
        public getEvents(date: Date): void {
            let self = this;
            this.$scope.eventSource({ date: date, id: self.calendarId }).then((events: IEvent[]) => {
                events.sort((a, b) => {
                    if(moment(a.fromTime, "h:mm A") > moment(b.fromTime, "h:mm A")) return 1;
                    else return -1;
                })
                this.todaysEvents = events;
            }, () => {
                this.todaysEvents = [];
            })

            // return [];
        }

        /**
         * Returns all the dates of a month that has Events associated with them
         * @param month 
         * @returns {number[]}
         */
        public getDaysContainingEvents(): void {
            let self = this;
            this.$scope.daysContainingEvents({ id: self.calendarId }).then((dates) => {
                this.eventDates = dates;
            }, () => {
                this.eventDates = [];
            });
        }

        /**
         * Will be called when Prev month is clicked
         * This changes to prev month
         */
        public prevMonth(): void {
            let prevMonth = moment(this.currMonth, 'YYYY/MM').add(-1, 'month').format("YYYY/MM");
            if (prevMonth >= this.academicMonths[0]) {
                this.currMonth = prevMonth;
                this.getDates();
                this.monthChanged();
            }
        }

        /**
         * Will be called when Next month is clicked
         * This changes to next month
         */
        public nextMonth(): void {
            let nextMonth = moment(this.currMonth, 'YYYY/MM').add(1, 'month').format("YYYY/MM");
            if (nextMonth <= this.academicMonths[this.academicMonths.length - 1]) {
                this.currMonth = nextMonth;
                // this.calendarLabel = moment(nextMonth, "YYYY/MM").format("MMM YYYY");
                this.getDates();
                this.monthChanged();
            }
        }

        /**
         * @private
         * Called initially
         */
        private init() {
            let self = this;
            this.calendarId = this.$scope.calendarId || 'idNotPresent';
            this.calendarEventModalId = 'calendarEventModal_' + this.calendarId;
            this.startOfAcademicYear = <Month>(this.$scope.startOfAcademicYear || this.startOfAcademicYear);

            if (this.$scope.academicYear) {
                this.academicYear = this.$scope.academicYear;
                this.currMonth = moment(this.academicYear.split("-")[0] + this.startOfAcademicYear, "YYYYMMM").format("YYYY/MM");
                this.currYear = this.academicYear.split("-")[0];
            } else {
                let currMonth = <Month>moment().format("MMM");
                let academicYears = [];
                if (this.normalMonths.indexOf(currMonth) >= this.normalMonths.indexOf(this.startOfAcademicYear)) {
                    academicYears = [moment().format("YYYY"), moment().add(1, 'year').format("YYYY")];
                } else {
                    academicYears = [moment().add(-1, 'year').format("YYYY"), moment().format("YYYY")];
                }
                this.academicYear = academicYears.join("-");
                this.currYear = academicYears[0];
            }

            this.getDates();
            this.getDaysContainingEvents();
            this.dateSelected(moment(this.currYear + this.startOfAcademicYear, "YYYYMMM").toDate());

            let tpOptions = {
                minuteStep: 15,
                showSeconds: false,
                showMeridian: true
            };
            this.eventFromTimeId = "event_from_time_" + this.calendarId;
            this.eventToTimeId = "event_to_time_" + this.calendarId;
            (<any>$("#" + self.eventFromTimeId)).timepicker(tpOptions);
            (<any>$("#" + self.eventToTimeId)).timepicker(tpOptions);

            for (let i = 0; i < 12; i++) {
                this.academicMonths.push(moment(this.currYear, 'YYYY').month(this.startOfAcademicYear).add(i, 'month').format("YYYY/MM"));
            }

            this.enableAddEvents = this.$scope.enableAddEvents != undefined ? this.$scope.enableAddEvents : true;
            this.enableEditEvents = this.$scope.enableEditEvents != undefined ? this.$scope.enableEditEvents : true;
            this.enableDelEvents = this.$scope.enableDelEvents != undefined ? this.$scope.enableDelEvents : true;

        }

        /**
         * @private
         * Will be called when 'Save' button is clicked in the Add Event modal
         * This will create a new event for the selected date
         */
        private saveEvent() {
            let self = this;
            this.$scope.onSaveEvent({ date: this.selectedDate, event: this.modalEvent, id: self.calendarId }).then((event) => {
                this.todaysEvents.push(event);
                (<any>$("#" + self.calendarEventModalId)).modal("hide");
            }, () => {
                console.error("Failed to Save Event");
                (<any>$("#" + self.calendarEventModalId)).modal("hide");
            })
        }


        /**
         * @private
         * Will be called when 'Update' button is clicked in the Edit Event modal
         * this will update the event in the selected date
         */
        private updateEvent() {
            let self = this;
            this.$scope.onUpdateEvent({ date: this.selectedDate, event: this.modalEvent, id: self.calendarId }).then(() => {
                this.todaysEvents[this.modalEventIndex] = this.modalEvent;
                (<any>$("#" + self.calendarEventModalId)).modal("hide");
            }, () => {
                console.error("Failed to Update Event");
                (<any>$("#" + self.calendarEventModalId)).modal("hide");
            })
        }

        /**
         * @private
         * Will be called when remove event is clicked
         * Removes the Event from the selected Date
         * @param event 
         */
        private removeEvent(index): void {
            let self = this;
            this.$scope.onRemoveEvent({ date: this.selectedDate, event: this.todaysEvents[index], id: self.calendarId }).then(() => {
                this.todaysEvents.splice(index, 1);
            }, () => {
                console.error("Failed to Remove Event")
            })
        }

        /**
         * @private
         * Will be called when the Selected Month Changes
         */
        private monthChanged() {
            if (this.$scope.monthChanged) {
                let self = this;
                this.$scope.monthChanged({ month: this.currMonth, id: self.calendarId });
            }
        }

        /**
         * @private
         * Will be called when Add Event button is clicked
         * This will initialise the Event data binding to default values
         */
        private addEventModal() {
            this.addEvent = true;
            this.modalEvent = {
                fromTime: moment().format("h:mm A"),
                toTime: moment().format("h:mm A"),
                description: ""
            };
            let self = this;
            (<any>$("#" + self.calendarEventModalId)).modal("show");
        }

        /**
         * @private
         * Will be called when Edit Event button is clicked
         * This will initialise the Event data binding to selected Event values
         */
        private editEventModal(event: IEvent, index) {
            if (this.enableEditEvents) {
                this.addEvent = false;
                this.modalEventIndex = index;
                this.modalEvent = (<any>Object).assign({}, event);
                let self = this;
                (<any>$("#" + self.calendarEventModalId)).modal("show");
            }
        }

        /**
         * @private
         * Get All the dates in the Selected Month
         */
        private getDates(): void {
            let dates = [];
            let givenMonth = moment(this.currMonth, 'YYYY/MM');
            let startWeek = givenMonth.startOf("month").week(); // Get all the Weeks in a month
            let endWeek = startWeek + 5; // Get end week +5(Such that error is alleviated)
            if (startWeek > endWeek) { // In case of any Error (Mostly in the month of December)
                endWeek = givenMonth.isoWeeksInYear() + 1;
            }

            for (let i = startWeek; i <= endWeek; i++) {
                for (let j = 0; j < 7; j++) { // Days of the week
                    dates.push(moment(this.currMonth, 'YYYY/MM').week(i).isoWeekday(j).toDate());
                }
            }
            this.dates = dates;
        }

    }

    export class CalendarDirective
        implements angular.IDirective {
        restrict = 'E';
        template = require("./calendar.template.html")
        controller = CalendarCtrl;
        controllerAs = 'vm';
        scope = {
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
        }
    }

    angular.module("calendarApp", [])
        .directive("calendar", () => new CalendarDirective())
        .filter('ngDate', () => {
            return (date, inFormat, outFormat) => {
                if (outFormat) {
                    return moment(date, inFormat).format(outFormat);
                }
                return moment(date).format(inFormat);
            }
        });

}