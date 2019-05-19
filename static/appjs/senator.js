angular.module('Whitestone').controller('senatorController', ['$http', '$log', '$scope', '$location', '$routeParams', 'authenticationSvc',
    function ($http, $log, $scope, $location, $routeParams, authenticationSvc) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object
        var thisCtrl = this;

        //Meeting information and status
        this.activeMeeting = false;
        this.meetingId = 0;

        //Request status
        this.requestedTurn = false;

        this.email = authenticationSvc.getUser().email;

        //Boolean to determine if a Senator can speak
        this.turnApproved = false;

        //Senator information
        var firstName;
        var lastName;

        //Return Id value of interval function.
        //This is utilized to cancel the interval once the Senator has spoken
        this.intervalId;
        this.clearedInterval = true;
        this.time = "00:00:00";

        //Id of the html elements
        //These are used to hide/show elements when certain events are met
        this.waitingId = document.getElementById("wait");
        this.speakingId = document.getElementById("speaking");
        this.closeId = document.getElementById("close");
        this.activeId = document.getElementById("active");

        //Variables for the mediastream and mediarecorder
        this.media;
        this.stream;
        this.recorder;
        this.chunks;
        var audioFileName;

        this.isRecording = false;
        
        /**
         * Accesses the users microphone and asks for permission to enable it
         */
        this.allowMicrophone = function () {
            
            var d = new Date();
            //Configuring the media options. Establishing only to record audio and
            //save any file in the mp3 format
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
                function (mediaStream) {
                    thisCtrl.requestApproved = true;
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
                //Handle event where there is no media connected
            ).catch(function (err) {
                alert("No microphone detected");
            });
        };
        
        /**
         * If microphone is enabled, then start recording audio
         */
        this.startRecording = function () {
            thisCtrl.waitingId.style.display = "none";
            thisCtrl.speakingId.style.display = "inherit";
            thisCtrl.chunks = [];
            thisCtrl.recorder.start();
            thisCtrl.isRecording = true;
        };

        /**
         * Stop recording audio if a recording is in process
         */
        this.stopRecording = function () {

            thisCtrl.speakingId.style.display = "none";
            thisCtrl.recorder.stop();
            thisCtrl.isRecording = false;

        };

        /**
         * Converts the recorded audio data(blob) to an audio file in mp3 format.
         * Then sends the audio file to the server.
         */
        this.sendFile = function () {
            var blob = new Blob(thisCtrl.chunks, { type: thisCtrl.media.type });

            var d = new Date();
            //File specifications
            var date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
            var time = d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds();
            var DT = date + "-" + time;
            audioFileName = firstName + "-" + lastName + "-" + DT + ".mp3";

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
            //Data to send to the server
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

            // issue the http request to the rest API
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
         * Sends a request to the server to add a senator to the waiting list
         */
        this.requestTurn = function () {

            var data = {};
            data.uID = parseInt($routeParams.uid);

            var reqURL = "https://whitestone.uprm.edu/whitestone/requestTurn";
            
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // Now issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response request turn: " + JSON.stringify(response.data))
                    
                    thisCtrl.requestedTurn = true;
                    thisCtrl.closeId.style.display = "inherit";
                    thisCtrl.waitingId.style.display = "inherit";
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
            clearInterval(this.intervalId);
            thisCtrl.clearedInterval = true;
        };

        this.showTime = function () {
            var d = new Date();
            this.time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            document.getElementById("time").innerHTML = this.time;
        };

        /**
         * Sends a request to server to cancel a senators turn in the waiting list
         */
        this.cancelTurn = function () {

            // Now create the url with the route to talk with the rest API
            var data = {};
            data.uID = parseInt($routeParams.uid);
            var reqURL = "https://whitestone.uprm.edu//whitestone/cancelTurn";
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    //console.log("response cancel turn: " + JSON.stringify(response.data))

                    //Stop polling for approval.
                    thisCtrl.cancelInterval();

                    //Resetting data
                    thisCtrl.requestedTurn = false;

                    thisCtrl.closeId.style.display = "none";
                    thisCtrl.waitingId.style.display = "none";
                    thisCtrl.speakingId.style.display = "none";

                    thisCtrl.requestApproved = false;
                    if (thisCtrl.isRecording) {
                        thisCtrl.stopRecording();
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

        this.requestApproved = false;
        /**
         * Verifies in the server the state of the senator's request.
         */
        this.checkApproval = function () {
            // Now create the url with the route to talk with the rest API
            var data = {};
            data.uID = parseInt($routeParams.uid);
            var reqURL = "https://whitestone.uprm.edu/whitestone/checkapproval";
            var config = {
                headers:
                    { 'Content-Type': 'application/json;charset=utf-8;' }
            }

            // issue the http request to the rest API
            $http.post(reqURL, data, config).then(
                // Success function
                function (response) {
                    console.log("response check approval: " + JSON.stringify(response.data))
                    // assing the part details to the variable in the controller

                    //Getting the senator's name
                    firstName = response.data.TURN.firstname;
                    lastName = response.data.TURN.lastname;

                    //The Senator is still waiting
                    if (response.data.TURN.approval == "Wait") {
                     
                        //The Senator's turn has been denied 
                    }else if (response.data.TURN.approval == "Deny") {
                        thisCtrl.cancelTurn();

                        //The Senator's request has been approved
                    } else if (response.data.TURN.approval == "Accept") {
                        
                        //If request has been approved, but no microphone is connected
                        //keep asking for permission
                        if (!thisCtrl.requestApproved) {
                            thisCtrl.allowMicrophone();
                            
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
         * Retrieves an active meeting
         */
        this.loadActiveMeeting = function () {

            //Hide html elements until certain events are triggered
            this.activeId.style.display = "none"
            this.closeId.style.display = "none";
            this.waitingId.style.display = "none";
            this.speakingId.style.display = "none";

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
                    //console.log("response: " + JSON.stringify(response.data))

                    thisCtrl.activeId.style.display = "inherit";
                    thisCtrl.meeting = response.data.Meeting[0];

                    //Updating the status of the meeting
                    thisCtrl.activeMeeting = true;
                    thisCtrl.meetingId = response.data.Meeting[0].mID;

                    //Checking if the Senator has made a previous request
                    thisCtrl.checkRequest();
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
                    //console.log("response check meeting: " + JSON.stringify(response.data))
                    thisCtrl.checkApproval();
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
                        thisCtrl.activeId.style.display = "none";
                        //Disabling the buttons to avoid errors
                        thisCtrl.activeId.style.display = "none"
                        thisCtrl.closeId.style.display = "none";
                        thisCtrl.waitingId.style.display = "none";
                        thisCtrl.speakingId.style.display = "none";
                        if (!thisCtrl.clearedInterval) {
                            thisCtrl.cancelInterval();
                        }
                        if (thisCtrl.isRecording) {
                            thisCtrl.stopRecording();
                        }
                        thisCtrl.activeMeeting = false;
                    }
                    else {
                        alert("Error interno del sistema.");
                    }
                }
            );
        };

        /**
         * Verifies if the senator has made a request
         */
        this.checkRequest = function () {
            var reqURL = "https://whitestone.uprm.edu/whitestone/checkrequest/" + $routeParams.uid;

            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {
                    //console.log("response check request: " + JSON.stringify(response.data))
	
                    //Displaying html elements
                    thisCtrl.requestedTurn = true;
                    thisCtrl.closeId.style.display = "inherit";
                    thisCtrl.waitingId.style.display = "inherit";

                    thisCtrl.turnApproved = false;
                    //Timeout period is 5 seconds
                    thisCtrl.timedInterval(5000);
                    thisCtrl.checkApproval();
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

        //Redirection functions
        this.voteRedirect = function () {
            //IF user is recording or if there is an interval, cancel both before
            //transitioning
            if (!thisCtrl.clearedInterval) {
                thisCtrl.cancelInterval();
            }
            if (thisCtrl.isRecording) {
                thisCtrl.cancelTurn();
            }
            $location.url('/voting/' + $routeParams.role + '/' + $routeParams.uid);
        }
        this.logout = function () {
            if (thisCtrl.requestedTurn) {
                thisCtrl.cancelTurn();
            }
            thisCtrl.recordActivity("Logout");
            authenticationSvc.logoutUser();
            $location.url('/login');
        };
    }]);
