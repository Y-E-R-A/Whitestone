angular.module('Whitestone').controller('chancellorController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object
        var thisCtrl = this;

        this.email = authenticationSvc.getUser().email;

        //Meeting information and status
        this.activeMeeting = false;
        this.meetingId = 0;

        //The request list of Senators
        this.requestList = [];

        //Return Id value of interval function.
        //This is utilized to cancel the interval once the Senator has spoken
        this.intervalId;
        this.clearedInterval = true;

        //Determines if the chancellor is speaking
        this.recordingAudio = false;

        //boolean to determine if a senator is speaking.
        //Also used to allow only one Senator to speak
        this.senatorAllowed = false;
        this.senatorId = 0;

        //button ids. This is for enabling and disabling buttons
        this.startId = document.getElementById("start");
        this.stopId = document.getElementById("stop");
        this.activeId = document.getElementById("active");
        this.speakId = document.getElementById("speakMessage");

        //Variables for the mediastream and mediarecorder
        this.media;
        this.stream;
        this.recorder;
        this.chunks;
        var audioFileName;

        /**
         * Accesses the users microphone and asks for permission to enable it
         */
        this.allowMicrophone = function () {
            //constraints
            var d = new Date();
            var mediaOptions = {
                audio: {
                    tag: 'audio',
                    type: 'audio/mpeg',
                    ext: '.mp3',
                    gUM: { audio: true }
                }
            };
            thisCtrl.media = mediaOptions.audio;
            //Storing the MediaStream object to access the user's microphone
            navigator.mediaDevices.getUserMedia(thisCtrl.media.gUM).then(
                //Success. There is a connected microphone.
                //
                function (mediaStream) {
                    //thisCtrl.enableStart = false;
                    thisCtrl.startId.removeAttribute('disabled');
                    thisCtrl.stream = mediaStream;
                    thisCtrl.recorder = new MediaRecorder(thisCtrl.stream);

                    //This function listens to an event.
                    //The event is triggered when the user stops recording
                    thisCtrl.recorder.ondataavailable = function (e) {
                        thisCtrl.chunks.push(e.data);
                        if (thisCtrl.recorder.state == 'inactive') {
                            thisCtrl.sendFile();
                        }

                    };
                    thisCtrl.startRecording();
                }
            ).catch(function (err) {
                alert("No microphone detected");
            });
        };

        /**
         * If microphone is enabled, then start recording audio
         */
        this.startRecording = function () {
            this.startId.disabled = true;
            this.speakId.style.display = "inherit";
            this.stopId.removeAttribute('disabled');
            this.stopId.style.display = "inherit";
            thisCtrl.chunks = [];
            thisCtrl.recorder.start();
            thisCtrl.recordingAudio = true;
        };

        /**
         * Stop recording audio if a recording is in process
         */
        this.stopRecording = function () {

            this.stopId.disabled = true;
            this.stopId.style.display = "none";
            this.speakId.style.display = "none";
            this.startId.removeAttribute('disabled');
            thisCtrl.recorder.stop();
            thisCtrl.recordingAudio = false;
        };

        /**
         * Converts the recorded audio data(blob) to an audio file in mp3 format.
         * Then sends the audio file to the server.
         */
        this.sendFile = function () {
            var blob = new Blob(thisCtrl.chunks, { type: thisCtrl.media.type });

            var d = new Date();
            var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            var time = d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();
            var DT = date + "-" + time;
            audioFileName = "Chancellor-" + DT + ".mp3";

            var httpRequest = new XMLHttpRequest();
            httpRequest.open("POST", "https://whitestone.uprm.edu/whitestone/meeting/" + thisCtrl.meetingId + "/upload");
            var FileForm = new FormData();

            FileForm.append('file', blob, audioFileName);
            httpRequest.onload = function (ev) {
                //console.log("Request opened.");
            }
            httpRequest.setRequestHeader("Enctype", "multipart/form-data");
            httpRequest.send(FileForm);
            this.commitFile();
        };

        /**
         * Sends the generated audio file path location in the server to database
         */
        this.commitFile = function () {

            var data = {};
            data.mID = thisCtrl.meetingId;
            data.aname = audioFileName;
            data.aaddress = '/static/audio/' + thisCtrl.meetingId + '/' + audioFileName;
            data.atype = 'mp3';

            // Now create the url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/meeting/" + thisCtrl.meetingId + "/audio";
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("Data committed to the database: " + JSON.stringify(response.data))

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
         * Cancel the established interval if it exists
         */
        this.cancelInterval = function () {
            clearInterval(this.intervalId);
            thisCtrl.clearedInterval = true;
        };

        this.showTime = function () {
            var d = new Date();
            console.log("Show Time");
            this.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            console.log(thisCtrl.time);
            document.getElementById("time").innerHTML = this.time;
        };

        /**
         * Retrieves an active meeting
         */
        this.loadActiveMeeting = function () {

            this.stopId.disabled = true;
            this.stopId.style.display = "none";
            this.speakId.style.display = "none";
            this.activeId.style.display = "none";

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

                    thisCtrl.meeting = response.data.Meeting[0];

                    //Updating the status of the meeting
                    thisCtrl.activeMeeting = true;
                    thisCtrl.activeId.style.display = "inherit";
                    thisCtrl.meetingId = response.data.Meeting[0].mID;

                    thisCtrl.timedInterval(5000);

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
                        thisCtrl.activeId.style.display = "none";
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };
        /**
         * Establishes the time interval in which to execute a certain function 
         * @param {*} timeoutPeriod The time interval
         */
        this.timedInterval = function (timeoutPeriod) {

            thisCtrl.intervalId = setInterval(function () { thisCtrl.checkActiveMeeting() }, timeoutPeriod);
            thisCtrl.clearedInterval = false;
        };

        /**
         * Cancel the established interval if it exists
         */
        this.cancelInterval = function () {
            console.log("cancel Interval");
            clearInterval(this.intervalId);
            thisCtrl.clearedInterval = true;
        };

        /**
         * Retrieves the waiting list of senators
         */
        this.getRequestList = function () {
            //Resetting data in case senator cancelled turn
            thisCtrl.senatorAllowed = false;
            thisCtrl.senatorId = 0;

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/getrequestlist";
            // issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    //Clearing the waiting list to avoid duplicates
                    thisCtrl.requestList = [];
                    for (var i = 0; i < response.data.TURN.length; i++) {
                        if (response.data.TURN[i].approval != "Deny") {
                            thisCtrl.requestList.push(response.data.TURN[i]);
                        }
                        if (response.data.TURN[i].approval === "Accept") {

                            thisCtrl.senatorAllowed = true;
                            thisCtrl.senatorId = response.data.TURN[i].uID;
                        }
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
                        alert("Session has expired. Pleas log in");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                        thisCtrl.requestList = [];
                    }
                    else {
                        //alert("Internal Error");
                    }
                }
            );
        };

        /**
         * Grant permission to a user so that he/she can speak
         * @param {number} uid The ID of the user 
         */
        this.grantTurn = function (uid) {

            //Data that will be sent to the server
            var data = {};
            data.uID = uid;
            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/grantrequest";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }
            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {
                    thisCtrl.senatorAllowed = true;
                    thisCtrl.senatorId = uid;

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
         * Deny permission to a user so that he/she cannot speak
         * @param {number} uid The ID of the user 
         */
        this.denyTurn = function (uid) {

            // url with the route to talk with the rest API
            var data = {};
            data.uID = uid;
            var reqURL = "https://whitestone.uprm.edu/whitestone/denyrequest";

            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }
            // Now issue the http request to the rest API
            $http.put(reqURL, data, config).then(
                // Success function
                function (response) {

                    //Removing the users who have been denied from the waiting list
                    for (var i = 0; i < thisCtrl.requestList.length; i++) {
                        if (thisCtrl.requestList[i].uID == parseInt(uid)) {
                            thisCtrl.requestList.splice(i, 1);
                            break;
                        }
                    }
                    thisCtrl.senatorAllowed = false;
                    thisCtrl.senatorId = 0;

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
         * Verifies if there is still an active meeting
         */
        this.checkActiveMeeting = function () {

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
                    thisCtrl.getRequestList();
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
                        //Disabling the buttons to avoid errors
                        thisCtrl.stopId.disabled = true;
                        thisCtrl.stopId.style.display = "none";
                        thisCtrl.speakId.style.display = "none";
                        thisCtrl.activeId.style.display = "none";
                        if (thisCtrl.recordingAudio) {
                            console.log("I'm recording")
                            thisCtrl.stopRecording();
                        }
                        if (!thisCtrl.clearedInterval) {
                            thisCtrl.cancelInterval();
                        }
                        thisCtrl.activeMeeting = false;
                    }
                    else {
                        //alert("Internal Error.");
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

        this.loadActiveMeeting();

        //Transition functions
        this.voteRedirect = function () {

            if (thisCtrl.recordingAudio) {
                thisCtrl.stopRecording();
            }
            if (!thisCtrl.clearedInterval) {
                thisCtrl.cancelInterval();
            }
            $location.url('/votingChancellor/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {

            if (thisCtrl.recordingAudio) {
                thisCtrl.stopRecording();
            }
            if (!thisCtrl.clearedInterval) {
                thisCtrl.cancelInterval();
            }
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
