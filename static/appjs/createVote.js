angular.module('Whitestone').controller('votingController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object

        var thisCtrl = this;

        //Create Voting question form
        this.voteForm;

        //current User email  
        this.email = authenticationSvc.getUser().email;

        //List of active voting questions from database
        this.votingQuestion = [];
        this.votingChoices = [];

        //List of inactive voting question and choices
        this.inActiveVotingQuestion = [];
        this.inActiveVotingChoices = {};
        this.inActiveVotingResult = {};

        //The voting question
        var voting_question = "";

        //The objective of the vote
        var voting_instructions = "";

        //var fecha = $scope.nowdate;

        //The limit of answers
        var vLimit = "";
        this.meetingId = 0;

        var vid = 0;

        //The current active voting question
        this.activeVID = 0;

        //Variable that determines if there is an active voting question
        this.activeVotingQuestion = false;

        //variable that determines if there is an active meeting
        this.activeMeeting = false;

        //List of Users that can participate in voting question
        this.electSenatorList = [];
        this.electStudentSenatosList = [];
        this.exofficioSenatorList = [];
        this.exofficioStudentSenatorList = [];

        //Check box selection of titles
        this.titles = [{ title: 'Elect Student Senator', selected: false },
        { title: 'Ex-Officio Student', selected: false },
        { title: 'Elect', selected: false },
        { title: 'Ex-Officio', selected: false }];

        //Table that stores the selected participants
        this.selection = [];

        //Dictionary that stores the different alternatives
        //this.votingAlternatives = [{altId:"alt1", valt:''}]
        this.votingAlternatives = [{ altId: "alt1", valt: "", valid: true }];

        //Determines if a title was selected by the user
        this.optionSelected = true;

        /**
         * Add the participants of a voting question to the list
         * @param {*} title The title object selected
         */
        this.addToSelection = function (title) {

            //If the title has been selected, then remove it, else add it
            //to the list
            if (this.selection.includes(title.title)) {
                this.selection.splice(this.selection.indexOf(title.title), 1);
                title.selected = false;
            } else {
                this.selection.push(title.title);
                thisCtrl.optionSelected = true;
                title.selected = true;
            }
            if (thisCtrl.selection.length == 0) {

                thisCtrl.optionSelected = false;
            }

        }

        this.altCounter = 1;

        /**
         * Adds more voting choices to the list
         */
        this.addAlternative = function () {
            thisCtrl.altCounter = thisCtrl.altCounter + 1;
            this.votingAlternatives.push({ altId: "alt" + thisCtrl.altCounter, valt: "", valid: true });
        }

        /**
         * Removes the selected voting choice from the list
         * @param {*} index The position of the voting choice in the list
         */
        this.removeAlternative = function (index) {

            if (thisCtrl.votingAlternatives.length > 1) {
                this.votingAlternatives.splice(index, 1);
            } else {
                alert("At least one alternative needs to exist");
            }
        }

        this.alternativeValid = true;
        this.correctLimit = true;
        /**
         * Validates that the create Vote Form is correct.
         */
        this.checkcreate = function () {
            if (thisCtrl.activeVotingQuestion) {
                alert("There is a running active voting question");
            } else {

                if (this.voteForm.$valid) {
                    //Only valid if lenght of selected participant is not 0
                    if (thisCtrl.selection.length > 0) {

                        thisCtrl.alternativeValid = true;
                        //Validating that a voting choice has less than 100 characters
                        //and that it is not empty
                        for (var i = 0; i < this.votingAlternatives.length; i++) {
                            if (this.votingAlternatives[i].valt.length > 100 || this.votingAlternatives[i].valt === "") {
                                this.votingAlternatives[i].valid = false;
                                thisCtrl.alternativeValid = false;
                            } else if (!this.votingAlternatives[i].valt) {
                                this.votingAlternatives[i].valid = false;
                                thisCtrl.alternativeValid = false;
                            } else {
                                this.votingAlternatives[i].valid = true;
                            }
                        }
                        //Validating that the limit of selection is less than the list of 
                        //voting choices
                        if (thisCtrl.votingAlternatives.length < parseInt(thisCtrl.vLimit)) {
                            thisCtrl.correctLimit = false;
                        } else {
                            thisCtrl.correctLimit = true;
                            //If everything is valid, then create voting question
                            if (thisCtrl.alternativeValid) {
                                thisCtrl.createVote();
                            }

                        }

                    } else {
                        thisCtrl.optionSelected = false;
                    }
                } else {

                    alert("Form is invalid");
                }
            }
        }
        /**
         * Clears the create Vote Form
         */
        this.cancel = function () {

            this.voting_question = "";
            this.voting_instructions = "";
            this.vLimit = "";
            thisCtrl.votingAlternatives = [{ altId: "alt1", valt: "", valid: true }];
            for (var i = 0; i < thisCtrl.titles.length; i++) {

                if (thisCtrl.titles[i].selected == true) {

                    thisCtrl.titles[i].selected = false;
                }
            }
            this.selection = [];
            thisCtrl.voteForm.$setPristine();
            this.correctLimit = true;
        }

        /**
         * Creates a voting question
         */
        this.createVote = function () {

            //Data to send to the server
            var data = {};
            var d = new Date();
            data.creatorID = $routeParams.uid;
            data.mID = thisCtrl.meetingId;
            data.vquestion = this.voting_question;
            data.vinstructions = this.voting_instructions;
            data.vtime = d.getHours() + ":" + d.getMinutes();
            data.vdate = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
            data.selectionlimit = this.vLimit;
            data.vstatus = "Active";


            var reqURL = "https://whitestone.uprm.edu/whitestone/voting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {

                    thisCtrl.votingQuestion = response.data.Voting;
                    thisCtrl.activeVotingQuestion = true;
                    thisCtrl.selectParticipant(response.data.Voting.vID);
                    thisCtrl.activeVID = response.data.Voting.vID;

                    for (var y = 0; y < thisCtrl.votingAlternatives.length; y++) {

                        thisCtrl.createChoices(thisCtrl.votingAlternatives[y].valt, response.data.Voting.vID);
                    }
                    thisCtrl.cancel();
                    thisCtrl.recordActivity("Create");
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
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
        this.closeVotingQuestion = function () {

            //Data to send to the server
            var data = {};
            data.vID = thisCtrl.activeVID;
            data.vstatus = "Inactive";

            var data = {};
            data.vID = thisCtrl.activeVID;
            var reqURL = "https://whitestone.uprm.edu/whitestone/closevoting";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {

                    thisCtrl.activeVotingQuestion = false;
                    thisCtrl.votingQuestion = [];
                    thisCtrl.votingChoices = [];
                    thisCtrl.recordActivity("Close");

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Retrieves all the users who can participate in the voting question
         * @param {number} vid The ID of the voting question
         */
        this.selectParticipant = function (vid) {

            for (var i = 0; i < this.selection.length; i++) {
                if (this.selection[i] === 'Elect Student Senator') {
                    thisCtrl.getAllUsersByElectStudent(vid);
                } else if (this.selection[i] === 'Ex-Officio Student') {
                    thisCtrl.getAllUsersByExOfficioStudent(vid);
                } else if (this.selection[i] === 'Elect') {
                    thisCtrl.getAllUsersByElect(vid);
                } else if (this.selection[i] === 'Ex-Officio') {
                    thisCtrl.getAllUsersByExOfficio(vid);
                }
            }
        };

        /**
         * Retrieves the all the users who are elect student senators
         * @param {number} vid The ID of the voting question
         */
        this.getAllUsersByElectStudent = function (vid) {

            var reqURL = "https://whitestone.uprm.edu/whitestone/electstudentsenators";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.electSenatorList = response.data.User;
                    for (var i = 0; i < response.data.User.length; i++) {
                        thisCtrl.createVoteIn(vid, response.data.User[i].uID);
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
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the all the users who are ex-officio student senators
         * @param {number} vid The ID of the voting question
         */
        this.getAllUsersByExOfficioStudent = function (vid) {

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/exofficiostudentsenators";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.exofficioStudentSenatorList = response.data.User;

                    for (var i = 0; i < response.data.User.length; i++) {
                        thisCtrl.createVoteIn(vid, response.data.User[i].uID);

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
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the all the users who are elect senators
         * @param {number} vid The ID of the voting question
         */
        this.getAllUsersByElect = function (vid) {

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/electsenators";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.electSenatorList = response.data.User;
                    for (var i = 0; i < response.data.User.length; i++) {
                        thisCtrl.createVoteIn(vid, response.data.User[i].uID);

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
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the all the users who are ex-officio senators
         * @param {number} vid The ID of the voting question
         */
        this.getAllUsersByExOfficio = function (vid) {

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/exofficiosenators";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.exofficioSenatorList = response.data.User;

                    for (var i = 0; i < response.data.User.length; i++) {
                        thisCtrl.createVoteIn(vid, response.data.User[i].uID);

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
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Grants the selected users permission to participate in a 
         * voting question
         * @param {number} vid The ID of the selected users
         * @param {number} uid The ID of the active voting question
         */
        this.createVoteIn = function (vid, uid) {


            var data = {};
            data.vID = vid;
            data.uID = uid;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/" + uid + "/votesIn/" + vid;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response CreateVoteIn: " + JSON.stringify(response.data))

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
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
                    thisCtrl.meetingId = JSON.stringify(response.data.Meeting[0].mID);
                    thisCtrl.loadInActiveVotingQuestions();
                    thisCtrl.loadActiveVotingQuestions(thisCtrl.meetingId);

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Retrieves the active voting question
         * @param {number} meetingID The ID of the meeting 
         */
        this.loadActiveVotingQuestions = function (meetingID) {

            var reqURL = "https://whitestone.uprm.edu/whitestone/activevotings/" + meetingID;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.votingQuestion = response.data.Voting[0];
                    thisCtrl.activeVID = response.data.Voting[0].vID;
                    thisCtrl.loadActiveChoices(response.data.Voting[0].vID);
                    thisCtrl.activeVotingQuestion = true;

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the voting choice pertaining to the active voting
         * question
         * @param {number} vid The Id of the voting question
         */
        this.loadActiveChoices = function (vid) {

            var reqURL = "https://whitestone.uprm.edu/whitestone/voting/" + vid + "/choices";
            //console.log("reqURL: " + reqURL);
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {
                    thisCtrl.votingChoices = response.data.Choice;

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves all the inactive voting questions
         */
        this.loadInActiveVotingQuestions = function () {


            var reqURL = "https://whitestone.uprm.edu/whitestone/inactivevotings/" + thisCtrl.meetingId;

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.inActiveVotingQuestion = response.data.Voting;

                    for (var i = 0; i < thisCtrl.inActiveVotingQuestion.length; i++) {
                        thisCtrl.loadChoices(thisCtrl.inActiveVotingQuestion[i].vID);
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
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the voting choices pertaining to a voting question
         * @param {number} vid The ID of the voting question
         */
        this.loadChoices = function (vid) {

            var reqURL = "https://whitestone.uprm.edu/whitestone/voting/" + vid + "/choices";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.inActiveVotingChoices[vid] = response.data.Choice;

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Create the voting choices
         * @param {number} choice The voting choice
         * @param {number} vid The ID of the voting question
         */
        this.createChoices = function (choice, vid) {
            var data = {};
            data.choice = choice;
            data.vID = vid;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/voting/choice";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {

                    thisCtrl.votingChoices.push(response.data.Choice);

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
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
            var data = {};
            data.urole = $routeParams.role;
            data.email = thisCtrl.email;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action == "Create") {
                data.logmessage = "Create Votin Question"
            } else if (action == "Close") {
                data.logmessage = "Close Voting Question"
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

                    if (status === 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session expired. Please login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //alert("Request Not Found");
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        //Redirection Functions
        this.meetingRedirect = function () {

            $location.url("/meeting/" + $routeParams.role + '/' + $routeParams.uid);
        }
        this.oldMeetingRedirect = function () {

            $location.url('/oldMeeting/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };

        this.loadActiveMeeting();

    }]);
