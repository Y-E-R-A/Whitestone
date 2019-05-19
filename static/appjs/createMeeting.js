angular.module('Whitestone').controller('createMeetingController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc', '$window',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc, $window) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object

        var thisCtrl = this;

        var meeting_name = "";

        var meeting_desc = "";

        var meeting_status = "";

        this.email = authenticationSvc.getUser().email;

        this.active = false;
        this.meetingId = 0;
        var id = 0;

        //this.meetingNVal = false;
        //this.meetingDVal = false;
        this.meeting = [];

        //Form for the meeting 
        this.meetingForm;
        this.showMessage = false;

        /**
         * Verifies if the input form to create a user is correct
         */
        this.checkCreate = function () {
            if (thisCtrl.meetingForm.$valid) {
                thisCtrl.showMessage = false;
                thisCtrl.createMeeting();
            } else {
                thisCtrl.showMessage = true;
            }
        };

        /**
         * Clears the input fields and sets the Form to pristine
         */
        this.clearForm = function () {
            this.meeting_name = "";
            this.meeting_desc = "";
            thisCtrl.meetingForm.$setPristine();
        };

        /**
         * Creates a Meeting
         */
        this.createMeeting = function () {

            //Instance of Date object to retieve date and time
            var d = new Date();
            //Data to send to the server
            var data = {};
            data.mname = this.meeting_name;
            data.mdescription = this.meeting_desc;
            data.mdate = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.mtime = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            data.mstatus = "Active";

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activemeeting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {

                    thisCtrl.active = true;
                    thisCtrl.meetingId = response.data.Meeting.mID;
                    thisCtrl.meeting = response.data.Meeting;
                    thisCtrl.clearForm();
                    thisCtrl.recordActivity("Create");
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please login");
                    }
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Closes an active meeting if it exists
         */
        this.closeMeeting = function () {

            //Data to send to the server
            var data = {};
            data.mID = thisCtrl.meetingId;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/meetingstatus";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    thisCtrl.active = false;
                    thisCtrl.recordActivity("Close");
                    thisCtrl.clearWaitingList();
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please login");
                    }
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Empties the waiting list of Senators
         */
        this.clearWaitingList = function () {


            var data = {};

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/emptylist";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response clear List: " + JSON.stringify(response.data))

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please login");
                    }
                    else if (status == 400) {
                        alert("Malformed Request");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Retrieves an active meeting
         */
        this.loadActiveMeeting = function () {


            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activemeeting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.meeting = response.data.Meeting[0];
                    thisCtrl.active = true;
                    thisCtrl.meetingId = response.data.Meeting[0].mID;

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please login");
                    }
                    else if (status == 400) {
                        alert("Malformed Request");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Records the different actions from the current user
         * @param {string} action The type of action to record
         */
        this.recordActivity = function (action) {

            var d = new Date();

            //Data to send to the server
            var data = {};
            data.urole = $routeParams.role;
            data.uemail = thisCtrl.email;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action === "Create") {
                data.logmessage = "Create Meeting";
            } else if (action === "Close") {
                data.logmessage = "Close Meeting";
            } else if (action === "Logout") {
                data.logmessage = "Logout";
            }

            //url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activitylog";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response record AL: " + JSON.stringify(response.data))

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please login");
                    }
                    else if (status == 400) {
                        alert("Malformed Request");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Verifies if there is an active voting question before closing a meeting
         */
        this.checkActiveVotingQuestion = function () {

            var reqURL = "https://whitestone.uprm.edu/whitestone/activevotings/" + thisCtrl.meetingId;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {
                    //Reminds the user and asks for confirmation
                    if (confirm("There is active voting question, do you want to close everything?")) {
                        thisCtrl.closeMeeting();
                        thisCtrl.closeVotingQuestion(response.data.Voting[0].vID);
                    } else {

                    }
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    //thisCtrl.closeMeeting();
                    var status = response.status;

                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please log in");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                        thisCtrl.closeMeeting();
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Closes an active voting question
         * @param {number} vID The ID of the active voting question
         */
        this.closeVotingQuestion = function (vID) {
            //Data to send to the server
            var data = {};
            data.vID = vID;

            var reqURL = "https://whitestone.uprm.edu/whitestone/closevoting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response Close: " + JSON.stringify(response.data))

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Please log in");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        this.loadActiveMeeting();
        //Redirection functions
        this.voteRedirect = function () {

            $location.url('/Vote/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.oldMeetingRedirect = function () {

            $location.url('/oldMeeting/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
