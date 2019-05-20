angular.module('Whitestone').controller('oldMeetingsController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        var thisCtrl = this;

        this.messageList = [];

        //Old Meeting List
        this.oldMeetingList = [];
        //Voting Questions List
        this.votingQuestionList = [];
        //Choice List
        this.votingChoiceList = {};

        //Audio Files List
        this.audioFilesList = [];

        //Selected Audio Files List
        this.selectedAudioFilesList = [];

        this.email = authenticationSvc.getUser().email;

        var meetingId = 0;
        var votingQuestionId = 0;

        var vid = 0;

        var selectedAudioFile;

        //This variable is used to filter through the names of the meeting list
        this.orderList = "mname";

        thisCtrl.list = [];
        thisCtrl.selected = false;

        /**
         * Verifies if a meeting has been selected and if it is, then retrieves it's
         * information. If deselected, then clear information
         * @param {*} meeting The selected meeting
         */
        this.checkMeeting = function (meeting) {
            if (meeting.checked) {
                //Setting all meeting checked variables to false
                for (var i = 0; i < thisCtrl.oldMeetingList.length; i++) {
                    thisCtrl.oldMeetingList[i].checked = false;
                }
                meeting.checked = true;
                thisCtrl.selected = true;
                thisCtrl.loadInActiveVotingQuestions(meeting.mID);

            } else {

                thisCtrl.selected = false;
                meeting.checked = false;

            };

        };


        /**
         * Retrieves all the existing meetings
         */
        this.loadMeetings = function () {

            var reqURL = "https://whitestone.uprm.edu/whitestone/meeting/oldmeetings";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }
            $http.get(reqURL).then(// success call back
                function (response) {

                    thisCtrl.oldMeetingList = response.data.Meeting;
                    for (var i = 0; i < thisCtrl.oldMeetingList.length; i++) {
                        thisCtrl.oldMeetingList[i]["checked"] = false;
                    }

                }, // error callback
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Pleas login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                    }
                    else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Retrieves the voting questions related to the meeting
         * @param {number} meetingId The ID of the selected meeting
         */
        this.loadInActiveVotingQuestions = function (meetingId) {
            //Clearing data each time a new meeting is selected
            thisCtrl.votingQuestionList = [];
            thisCtrl.votingChoiceList = {};
            var reqURL = "https://whitestone.uprm.edu/whitestone/inactivevotings/" + meetingId;
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.votingQuestionList = response.data.Voting;
                    for (var i = 0; i < response.data.Voting.length; i++) {
                        thisCtrl.loadChoices(response.data.Voting[i].vID);
                    }
                    thisCtrl.loadAudioFiles(meetingId);//Added by Ariel

                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    thisCtrl.loadAudioFiles(meetingId);
                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Pleas login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                        thisCtrl.votingQuestionList = [];
                        thisCtrl.audioFilesList = [];
                    }
                    else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Retrives the audio files related to a meeting
         * @param {number} mID The ID of the selected meeting
         */
        this.loadAudioFiles = function (mID) {
            var reqURL = "https://whitestone.uprm.edu/whitestone/meeting/" + mID + "/audio";
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            //issue the http request to the rest API
            $http.get(reqURL).then(function (response) {

                //Adding the audio files individually to the list
                for (var i = 0; i < response.data.Audio.length; i++) {
                    thisCtrl.audioFilesList[i] = response.data.Audio[i];
                }

            }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;
                    //console.log("thiscredentialList: " +JSON.stringify(thisCtrl.credentialsList));
                    //console.log("Error: " + reqURL);
                    if (status == 0) {
                        alert("No Internet Connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired. Pleas login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                        thisCtrl.audioFilesList = [];
                    }
                    else if (status == 400) {
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
                    thisCtrl.votingChoiceList[vid] = response.data.Choice;

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
                        alert("Session has expired. Pleas login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
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

            //Data that will be sent to the server
            var data = {};
            data.urole = $routeParams.role;
            data.uemail = thisCtrl.email;
            data.date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            data.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            if (action === "Logout") {
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
                        alert("Session has expired. Pleas login");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                    } else if (status == 400) {
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        //Redirection functions
        this.meetingRedirect = function () {
            $location.url("/meeting/" + $routeParams.role + '/' + $routeParams.uid);
        }

        this.voteRedirect = function () {
            $location.url('/Vote/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
        this.loadMeetings();
    }]);
