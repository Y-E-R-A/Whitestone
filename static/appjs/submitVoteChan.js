angular.module('Whitestone').controller('submitVoteChanController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object

        var thisCtrl = this;

        //List of voting voting questions from database
        this.VotingQuestion = [];
        this.votingChoices = [];
        this.limit = 0;
        this.count = 0;

        this.email = authenticationSvc.getUser().email;

        //Checking if user can participate
        this.participation = true;
        this.isParticipant = false;

        //The voting question
        var voting_question = "";

        //The objective of the vote
        var voting_objective = "";

        this.activeMeeting = false;
        this.activeVotingQuestion = false;


        this.selectedChoice = [];

        this.activeMeetingId = 0;
        this.votingId = 0;
        var altId = 0;

        var selection = [];

        /**
         * Verifies if the user has selected a voting choice
         * @param {*} choice The selected choice object
         */
        this.checkChoice = function (choice) {
            if (thisCtrl.selectedChoice.includes(choice.altID)) {
                thisCtrl.count--;
                //console.log('--');
                //item.checked = false;
                var findId = thisCtrl.selectedChoice.indexOf(choice.altID);
                thisCtrl.selectedChoice.splice(findId, 1);
            } else {
                //console.log('++' + item.name);
                thisCtrl.count++;
                //item.checked = true;
                thisCtrl.selectedChoice.push(choice.altID);
            };
        };

        /**
         * Verifies if the user wants to submit their first before actually
         * sending the user's choices to the server
         */
        this.checkSubmit = function () {

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
                    if (confirm("Are you sure you want to submit your answer?")) {
                        thisCtrl.disableParticipation();
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
                        alert("Session has expired. Please login again");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                        thisCtrl.participation = true;
                        thisCtrl.isParticipant = false;
                        thisCtrl.activeMeeting = false;
                        thisCtrl.activeVotingQuestion = false;
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


            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activemeeting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }
            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.activeMeeting = true;
                    thisCtrl.activeMeetingId = response.data.Meeting[0].mID;
                    thisCtrl.loadVotingQuestion(response.data.Meeting[0].mID);

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
         * Retrieves a voting question which is related to a meeting
         * @param {number} meetingID The ID of the active meeting
         */
        this.loadVotingQuestion = function (meetingID) {


            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activevotings/" + meetingID;
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.activeVotingQuestion = true;
                    thisCtrl.votingId = response.data.Voting[0].vID;
                    thisCtrl.checkParticipation(response.data.Voting[0].vID);
                    thisCtrl.VotingQuestion = response.data.Voting[0];
                    thisCtrl.limit = response.data.Voting[0].selectionlimit;
                    thisCtrl.loadChoices(response.data.Voting[0].vID);


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
         * Verifies if the user can participate in the voting question
         * @param {number} vid The ID of the voting question
         */
        this.checkParticipation = function (vid) {

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/" + $routeParams.uid + "/votesIn/" + vid;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {
                    thisCtrl.participation = response.data.Participant.exercise_vote;
                    thisCtrl.isParticipant = true;

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
                        alert("Session has expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                        thisCtrl.isParticipant = false;
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Retrieves the voting choices related to a voting question
         * @param {number} vid The ID of the voting question
         */
        this.loadChoices = function (vid) {

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activevoting/" + vid + "/choices";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.votingChoices = response.data.Choice;

                    for (var i = 0; i < thisCtrl.votingChoices.length; i++) {
                        thisCtrl.votingChoices[i]["checked"] = false;
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
         * Sends the voting choices selected from the user to the server
         * @param {number} choiceId The ID of the voting choice
         */
        this.submitVote = function (choiceId) {

            //Data to send to the server
            var data = {};
            data.altID = choiceId;
            data.mID = thisCtrl.activeMeetingId;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/votingresults";
            //console.log("reqURL: " + reqURL);
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response: " + JSON.stringify(response.data))

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
         * Disable the participation once a user has submitted his/her vote
         */
        this.disableParticipation = function () {

            //Data to send to the server
            var data = {};
            data.uID = $routeParams.uid;
            data.vID = thisCtrl.votingId;
            // url with the route to talk with the rest API

            var reqURL = "https://whitestone.uprm.edu/whitestone/" + $routeParams.uid + "/votesIn/" + thisCtrl.votingId;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    thisCtrl.participation = true;
                    var x = thisCtrl.selectedChoice.length;
                    for (var i = 0; i < x; i++) {
                        thisCtrl.submitVote(thisCtrl.selectedChoice[i]);
                    }
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
                        thisCtrl.participation = true;
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
            if (action === "Vote") {
                data.logmessage = "Vote";
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

        //Redirection functions
        this.turnsRedirect = function () {
            $location.url('/ChancellorTurns/' + $routeParams.role + '/' + $routeParams.uid);
        };

        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };

        this.loadActiveMeeting();
    }]);
