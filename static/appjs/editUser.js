angular.module('Whitestone').controller('editUserController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        var thisCtrl = this;
        this.newUserList = [];
        //Data of selected user
        var first_name = "";
        var last_name = "";
        var about = "";
        var email = "";
        var password = "";
        var role = "";
        var title = "";
        this.selectedUser;
        this.uID = 0;
        this.cID = 0;
        this.roleSelect = { selected: '' };
        this.titleSelect = { selected: '' };

        //Current email of logged in user
        this.userEmail = authenticationSvc.getUser().email;

        this.showForm = false;
        this.showMessage = false;
        this.userForm;

        //Boolean variables to validate user input
        this.firstnameVal = false;
        this.lastnameVal = false;
        this.pinVal = false;
        this.emailVal = false;
        this.aboutVal = false;

        //This variable is used to filter through the names of the meeting list
        this.orderList = "firstname";


        this.titles = [{ title: 'Elect Student Senator', selected: false },
        { title: 'Ex-Officio Student Senator', selected: false },
        { title: 'Elect Senator', selected: false },
        { title: 'Ex-Officio Senator', selected: false },
        { title: 'Staff', selected: false }];

        this.roles = [{ role: 'Secretary', selected: false },
        { role: 'Senator', selected: false },
        { role: 'Chancellor', selected: false },
        { role: 'Administrator', selected: false }];


        /**
         * Displays the data of the selected user in the html page. If the "Select User"
         * option is selected, clear all input and hide edit Form
         */
        this.loadForm = function () {

            if (thisCtrl.selectedUser === null) {
                this.roleSelect.selected = '';
                this.titleSelect.selected = '';
                this.first_name = "";
                this.last_name = "";
                this.email = "";
                this.about = "";
                thisCtrl.uID = 0;
                thisCtrl.cID = 0;
                this.showForm = false;
                this.password = "";

            } else {
                this.roleSelect.selected = thisCtrl.selectedUser.role;
                this.titleSelect.selected = thisCtrl.selectedUser.classification;
                this.uID = thisCtrl.selectedUser.uid;
                this.cID = thisCtrl.selectedUser.cid;
                this.first_name = thisCtrl.selectedUser.firstname;
                this.last_name = thisCtrl.selectedUser.lastname;
                this.about = thisCtrl.selectedUser.about;
                this.email = thisCtrl.selectedUser.email;
                this.password = thisCtrl.selectedUser.pin;
                thisCtrl.showForm = true;
            }
            thisCtrl.showMessage = false;
        }
        /**
         * Clears all the data from the input fields and sets the edit Form to pristine. 
         */
        this.cancel = function () {
            this.roleSelect.selected = '';
            this.titleSelect.selected = '';
            this.first_name = "";
            this.last_name = "";
            this.about = "";
            this.email = "";
            thisCtrl.uID = 0;
            thisCtrl.cID = 0;
            this.showForm = false;
            this.selectedUser = {};
            this.password = "";
        }

        /**
         * Validates whether the input fields are correct
         */
        this.checkForm = function () {
            //Regular expressions to validate input
            var fnPattern = new RegExp("^[a-zA-Z]{1,20}$");
            var lnPattern = new RegExp("^[a-zA-Z]{1,20}$");
            var pinPattern = new RegExp("^[0-9]{1,4}$");
            var emailPattern = new RegExp("^[a-z]+\.[a-z]*[0-9]*@upr\.edu$");
            var abPattern = new RegExp("^[a-zA-Z\d\' ']{1,150}$");

            if (this.roleSelect.selected == "Secretary" && this.titleSelect.selected != "Staff") {
                alert("Secretaries can only have the 'Staff' classification");
            } else if (this.roleSelect.selected == "Senator" && this.titleSelect.selected == "Staff") {
                alert("Senators cannot have the 'Staff' classification");
            } else if (this.roleSelect.selected == "Chancellor" && this.titleSelect.selected != "Ex-Officio Senator") {
                alert("Chancellors can only have the 'Ex-Officio' classification");
            } else if (this.roleSelect.selected == "Administrator" && this.titleSelect.selected != "Staff") {
                alert("Administrators can only have the 'Staff' classification")
            } else {
                //If input data does not clears= regular expression, then display appropriate error
                //message
                if (!fnPattern.test(this.first_name)) {
                    this.firstnameVal = true;
                } else {
                    this.firstnameVal = false;
                }
                if (!lnPattern.test(this.last_name)) {
                    this.lastnameVal = true;
                } else {
                    this.lastnameVal = false;
                }
                if (!abPattern.test(this.about)) {
                    this.aboutVal = true;
                } else {
                    this.aboutVal = false;
                }
                if (!pinPattern.test(this.password)) {
                    this.pinVal = true;
                } else {
                    this.pinVal = false;
                }
                if (!emailPattern.test(this.email)) {
                    this.emailVal = true;
                } else {
                    this.emailVal = false;
                }

                //If all input fields are correct, then edit user
                if (!this.firstnameVal && !this.lastnameVal && !this.pinVal && !this.emailVal && !this.aboutVal) {
                    //alert("Form is valid");
                    thisCtrl.editCredentials();
                } else {
                    alert("the form is incorrect");
                }
                //thisCtrl.editCredentials();
            }


        }
        /**
         * Edit the credentials of the selected user
         */
        this.editCredentials = function () {

            //Data to send to the server
            var data = {};
            data.email = this.email;
            data.pin = this.password;
            data.cID = thisCtrl.cID;

            // Now create the url with the route to talk with the rest API

            var reqURL = "https://whitestone.uprm.edu/whitestone/credentials";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    thisCtrl.editUser();

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    //console.log("Error: " + reqURL);
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
                    }else if(status == 400){
                        //alert("Malformed request")
                    }else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        /**
         * Edit the information of the selected user
         */
        this.editUser = function () {

            //data to send to the server
            var data = {};
            data.ufirstname = this.first_name;
            data.ulastname = this.last_name;
            data.udescription = this.about;
            data.urole = this.roleSelect.selected;
            data.uclassification = this.titleSelect.selected;

            //Resetting data
            thisCtrl.titleSelect.selected = '';
            thisCtrl.roleSelect.selected = '';
            thisCtrl.showForm = false;
            thisCtrl.myUser = {};

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/edituser/" + thisCtrl.uID;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {

                    thisCtrl.cancel();
                    thisCtrl.loadUsers();
                    thisCtrl.recordActivity("Edit", data.ufirstname, data.ulastname);
                    alert("The user has been edited");

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
                    }else if(status == 400){
                        //alert("Malformed request")
                    }else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        /**
         * Asks for confirmation to the user before deleting an user.
         */
        this.checkDelete = function () {
            if (confirm("Are you sure you want to delete the user?")) {
                thisCtrl.deleteUser();
            }
        };

        /**
         * Delete the selected user
         */
        this.deleteUser = function () {

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/delete/user/" + thisCtrl.uID;
            //Data to send to the server
            var data = {};
            data.uID = thisCtrl.uID;
            var fname = this.first_name;
            var lname = this.last_name;
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    thisCtrl.cancel();
                    thisCtrl.loadUsers();
                    thisCtrl.recordActivity("Delete", fname, lname);

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
                    }else if(status == 400){
                        //alert("Malformed request")
                    }else {
                        //alert("Internal Error.");
                    }
                }
            );
        };
        /**
         * Retrieves all the existing users
         */
        this.loadUsers = function () {

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/users";

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {
                    //Removes the current administrator from the list
                    for (var i = 0; i < response.data.User.length; i++) {
                        if (parseInt($routeParams.uid) == response.data.User[i].uid) {
                            response.data.User.splice(i, 1);
                            break;
                        }
                    }
                    thisCtrl.newUserList = response.data.User;


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
                    }else if(status == 400){
                        //alert("Malformed request")
                    }else {
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

            //Data to send to the server
            var data = {};
            data.urole = $routeParams.role;
            data.uemail = thisCtrl.userEmail;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action == "Delete") {
                data.logmessage = "Deleted user " + fname + " " + lname;
            } else if (action == "Edit") {
                data.logmessage = "Edit user " + fname + " " + lname;
            } else if (action == "Logout") {
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
                    }else if(status == 400){
                        //alert("Malformed request")
                    }else {
                        //alert("Internal Error.");
                    }
                }
            );
        };

        this.loadUsers();

        //Redirection functions
        this.createUserRedirect = function () {
            $location.url("/createUser/" + $routeParams.role + '/' + $routeParams.uid);
        }

        this.activityLogRedirect = function () {
            $location.url("/activityLog/" + $routeParams.role + '/' + $routeParams.uid);
        }

        this.settingsRedirect = function () {

        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
