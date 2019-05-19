angular.module('Whitestone').controller('LoginController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc', '$window',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc, $window) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object

        var thisCtrl = this;

        var email = "";

        var password = "";

        this.radiusLogin = false;
        this.loginForm;
        this.emailInput;
        /**
         * validates if the input fields are correct
         */
        this.checkForm = function () {
            if (this.loginForm.$valid) {
                if (this.radiusLogin == true) {
                    thisCtrl.radius();
                }
                else {
                    thisCtrl.loginUser();
                }
            } else {
                if (this.radiusLogin) {
                    alert("Invalid email and/or password. Please try again.");
                } else {
                    alert("Invalid email and/or pin. Please try again.");
                }
            }
        }

        /**
         * RADIUS server protocol to validate user credentials
         */
        this.radius = function () {

            var data = {};
            data.email = this.email.replace('@upr.edu', '');
            data.password = this.password;


            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/radius";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }
            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response: "+JSON.stringify(response));

                    //Verify the response from the RADIUS server
                    var radiusResponse = JSON.stringify(response);
                    var acceptanceString = "Success";
                    var acceptance = radiusResponse.includes(acceptanceString)
                    if (acceptance) {
                        thisCtrl.loginUser();
                    }
                    else {
                        alert("Invalid email and/or password.");
                    }
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
                        alert("Session expired. Please login");
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
         * Validates the user credentials in the application and logs in the user
         * depending on his/her role
         */
        this.loginUser = function () {

            var data = {};
            data.email = this.email;
            data.pin = this.password;
            data.login = "LOCAL;"

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/credentials/user";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    var role = response.data.User.role;
                    var uid = response.data.User.uid;

                    //Storing the users data
                    authenticationSvc.login(response.data.User.email, response.data.User.role);
                    //Storing the activity
                    thisCtrl.recordActivity(role);
                    if (role == "Administrator") {
                        $location.url('/createUser/' + role + '/' + uid);
                    } else if (role == "Secretary") {
                        $location.url("/meeting/" + role + '/' + uid);
                    } else if (role == "Senator") {
                        $location.url('/voting/' + role + "/" + uid);
                    } else if (role == "Chancellor") {
                        $location.url('/votingChancellor/' + role + "/" + uid);
                    }


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
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //Create Warning redirect
                        if (thisCtrl.radius) {
                            alert("Invalid email and/or password. Please try again.");
                        } else {
                            alert("Invalid email and/or pin. Please try again.");
                        }
                    }
                    else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        /**
         * Records the different actions from the current user
         * @param {string} role The role of the user
         */
        this.recordActivity = function (role) {

            var d = new Date();

            //Data that will be sent to the server
            var data = {};
            data.urole = role;
            data.uemail = this.email;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            data.logmessage = "Log in";

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
                        alert("Session expired. Please login");
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

    }]);
