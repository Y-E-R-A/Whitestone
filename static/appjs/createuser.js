angular.module('Whitestone').controller('createUserController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object
        var thisCtrl = this;

        //Variables that store user input
        var first_name = "";
        var last_name = "";
        var about = "";
        var password = "";
        var email = "";
        var role = "";
        this.userForm;
        var title = "";

        //the logged in user email
        this.userEmail = authenticationSvc.getUser().email;

        var id = 0;
        var cID = 0;

        // This variable hold the information on the part
        // as read from the REST API
        var credentialList = {};

        /**
         * Validates if the user input is correct
         */
        this.checkForm = function () {
            if (this.userForm.$valid) {
                //Validates that each role is paired with the correct title
                if (this.role == "Secretary" && this.title != "Staff") {
                    alert("Secretaries can only have the 'Staff' classification");
                } else if (this.role == "Senator" && this.title == "Staff") {
                    alert("Senators cannot have the 'Staff' classification");
                } else if (this.role == "Chancellor" && this.title != "Ex-Officio Senator") {
                    alert("Chancellors can only have the 'Ex-Officio' classification");
                } else if (this.role == "Administrator" && this.title != "Staff") {
                    alert("Administrators can only have the 'Staff' classification")
                } else {

                    thisCtrl.createNewCredentials();
                }

            } else {
                alert("Please fill the fields correctly");
            }
        }

        /**
         * Creates the credentials for the new user
         */
        this.createNewCredentials = function () {

            //Data to send to the server
            var data = {};
            data.email = this.email;
            data.pin = this.password;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/credentials";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {

                    var cID = response.data.Credential.cID;
                    thisCtrl.createNewUser(cID);

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
                        alert("Session has expired. Please log in again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //alert("Malformed request")
                    } else {
                        //alert("Internal Error.");
                    }
                }
            );
        };
        /**
         * Creates a new user
         * @param {number} cID The ID of the credentials of the new user
         */
        this.createNewUser = function (cID) {
            //Data to send to the database
            var data = {};
            data.cID = cID;
            data.ufirstname = this.first_name;
            data.ulastname = this.last_name;
            data.udescription = this.about;
            data.urole = this.role;
            data.uclassification = this.title;

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/users";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    alert("The User has been created")
                    thisCtrl.clear();
                    thisCtrl.recordActivity("Create", data.ufirstname, data.ulastname);

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
                        alert("Session has expired. Please log in again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //alert("Malformed request")
                    } else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        /**
         * Records the different actions from the current user
         * @param {string} action The type of action to record
         * @param {string} fname The firstname of the new user
         * @param {string} lname The last name of the new user
         */
        this.recordActivity = function (action, fname, lname) {

            var d = new Date();

            //Data that will be sent to the database
            var data = {};
            data.urole = $routeParams.role;
            data.uemail = thisCtrl.userEmail;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action === "Create") {
                data.logmessage = "Create new user " + fname + " " + lname;
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
                        alert("Session has expired. Please log in again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //alert("Malformed request")
                    } else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        /**
         * Clears all input fields and sets the Form to pristine.
         */
        this.clear = function () {
            this.first_name = "";
            this.last_name = "";
            this.about = "";
            this.password = "";
            this.email = "";
            this.role = "";
            this.title = "";
            thisCtrl.userForm.$setPristine();
        };

        //Redirect Functions
        this.activityLogRedirect = function () {
            $location.url('/activityLog/' + $routeParams.role + '/' + $routeParams.uid);
        }

        this.editUserRedirect = function () {
            $location.url('/editUser/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.redirectLogOut = function () {
            $location.url('/ActivityLog/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout")
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
