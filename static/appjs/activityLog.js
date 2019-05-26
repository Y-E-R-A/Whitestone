angular.module('Whitestone').controller('activityLogController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {

        var thisCtrl = this;

        //Variable that will hold the input field
        var date = "";

        this.validation = false;

        //Stores the different actions
        this.newActivityLogList = [];

        this.email = authenticationSvc.getUser().email;

        /**
         * Search for all different actions performed in the application based on a given
         * date 
         */
        this.searchActivity = function () {

            // Data that will be sent to the server
            var data = {};
            data.date = this.date;

            var reqURL = "https://whitestone.uprm.edu/whitestone/getactivitylog";

            // It has two function call backs, one for success and one for error
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            $http.post(reqURL, data, config).then(// success call back
                function (response) {

                    thisCtrl.newActivityLogList = response.data.Log;
                    thisCtrl.validation = true

                }, // error callback
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
                    }
                    else if (status == 404) {
                        alert("Activity Not Found");
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

            //Data that will be sent to the server
            var data = {};
            data.urole = $routeParams.role;
            data.uemail = thisCtrl.email;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action == "Logout") {
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
                    else if (status == 400) {
                        //alert("Malformed Request");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
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
        //Redirection functions
        this.createUserRedirect = function () {
            $location.url("/createUser/" + $routeParams.role + '/' + $routeParams.uid);
        }

        this.editUserRedirect = function () {
            $location.url("/editUser/" + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
