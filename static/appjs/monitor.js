angular.module('Whitestone').controller('monitorController', ['$http', '$log', '$scope', '$location', '$routeParams',
    function($http, $log, $scope, $location, $routeParams) {
        // This variable lets you access this controller
        // from within the callbacks of the $http object

        var thisCtrl = this;
        
        //List of voting voting questions from database
        this.votingQuestion = [];
        this.votingChoices = [];

        //The voting question
        var voting_question = "";
        
        //The objective of the vote
        var voting_objective = "";
        
        //Boolean variables to determine if there is an active meeting or
        //active voting question
        this.activeMeeting = false;
        this.activeVotingQuestion = false;
        
        this.lastVotingQuestion = false;
        
        this.activeMeetingId =0;
        this.votingId =0;
        
        this.currentTime;
        this.currentDate;
        
        this.intervalID;

        /**
         * Retrieves an active meeting
         */
        this.loadActiveMeeting = function(){


            var d= new Date();
            thisCtrl.currentTime = d.getHours()+":"+d.getMinutes();
            
            thisCtrl.currentDate = d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
            
            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activemeeting";
            var config = { headers : 
                          {'Content-Type':'application/json;charset=utf-8;' }
                         }
        
            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    thisCtrl.activeMeeting = true;
                    thisCtrl.loadVotingQuestion(response.data.Meeting[0].mID);
                    
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired.");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                        thisCtrl.activeMeeting = false;
                    }else if(status==400){
                        //console.log("Malformed Request")
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
        this.loadVotingQuestion = function(meetingID){

        
            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activevotings/"+meetingID;

            var config = { headers : 
                          {'Content-Type':'application/json;charset=utf-8;' }
                         }
        
            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    //An active voting question is running
                    thisCtrl.activeVotingQuestion = true;
                    thisCtrl.lastVotingQuestion = false;
                    //Storing the voting ID of the voting question
                    thisCtrl.votingId = response.data.Voting[0].vID;

                    //Storing the voting question
                    thisCtrl.votingQuestion = response.data.Voting[0];

                    thisCtrl.loadActiveChoices(response.data.Voting[0].vID);
                    
 
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired.");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found")
                        thisCtrl.activeVotingQuestion = false;
                        thisCtrl.loadLastVotingQuestion(meetingID);
                        //alert("There is currently no active voting question");
                    }else if(status==400){
                        //console.log("Malformed Request")
                    }
                    else {
                        //alert("Internal error.");
                    }
                }
            );
        };
        /**
         * Retrieves the last voting question that was active
         * @param {number} meetingID The ID of the meeting
         */
        this.loadLastVotingQuestion = function(meetingID){

        
            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/inactivevotings/"+meetingID;
            var config = { headers : 
                          {'Content-Type':'application/json;charset=utf-8;' }
                         }
        
            // Now issue the http request to the rest API
            $http.get(reqURL).then(
                // Success function
                function (response) {

                    //An active voting question was closed
                    thisCtrl.lastVotingQuestion = true;
                    
                    //Storing the voting ID of the voting question
                    thisCtrl.votingId = response.data.Voting[0].vID;

                    //Storing the voting question
                    thisCtrl.votingQuestion = response.data.Voting[0];

                    thisCtrl.loadChoices(response.data.Voting[0].vID);
                    
 
                }, //Error function
                function (response) {
                    // This is the error function
                    // If we get here, some error occurred.
                    // Verify which was the cause and show an alert.
                    var status = response.status;

                    if (status == 0) {
                        alert("No Internet connection");
                    }
                    else if (status == 401) {
                        alert("Session has expired.");
                    }
                    else if (status == 403) {
                        alert("Not authorized to use the application");
                    }
                    else if (status == 404) {
                        //console.log("Request Not Found");
                        thisCtrl.lastVotingQuestion = false;
                    }else if(status==400){
                        //console.log("Malformed request")
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
        this.loadActiveChoices = function(vid){

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/activevoting/"+vid+"/choices";

            var config = { headers : 
                          {'Content-Type':'application/json;charset=utf-8;' }
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
                    var status = response.status;;

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
        this.loadChoices = function(vid){

            // url with the route to talk with the rest API
            var reqURL = "https://whitestone.uprm.edu/whitestone/voting/"+vid+"/choices";

            var config = { headers : 
                          {'Content-Type':'application/json;charset=utf-8;' }
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
                    var status = response.status;;

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
         * Establihes the interval in which the monitor web page will 
         * make a request
         * @param {number} timeoutPeriod The time interval
         */
        this.timedRefresh = function(timeoutPeriod){
           thisCtrl.intervalId = setInterval(function(){thisCtrl.loadActiveMeeting()},timeoutPeriod) //setTimeout("location.reload(true);",timeoutPeriod);
        };

        //Monitor will make a request every 5 seconds
        this.timedRefresh(5000);

}]);
