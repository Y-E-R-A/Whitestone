(function () {

    var app = angular.module('Whitestone', ['ngRoute']);

    /**
     * configure services by injecting their providers, for adding routes to the $routeProvider.
     * Used to establish the different controllers and provide the html pages. The resolve template is used
     * to validate if a user has permission to access a specific html page
     */
    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider, $location) {
        $routeProvider.when('/login', {
            templateUrl: '/static/pages/login.html',
            controller: 'LoginController',
            controllerAs: 'loginCtrl'
        }).when('/activityLog/:role/:uid', {
            templateUrl: '/static/pages/activityLog.html',
            controller: 'activityLogController',
            controllerAs: 'activityLogCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Administrator") {

                    } else {
                        return $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/meeting/:role/:uid', {
            templateUrl: '/static/pages/createMeeting.html',
            controller: 'createMeetingController',
            controllerAs: 'createMeetingCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();

                    if (user.role === "Secretary") {

                        return $q.when(user);
                    } else {

                        return $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/createUser/:role/:uid', {
            templateUrl: '/static/pages/createUser.html',
            controller: 'createUserController',
            controllerAs: 'createUserCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Administrator") {

                    } else {

                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/Vote/:role/:uid', {
            templateUrl: '/static/pages/createVote.html',
            controller: 'votingController',
            controllerAs: 'votingCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Secretary") {

                    } else {

                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/votingChancellor/:role/:uid', {
            templateUrl: '/static/pages/submitVoteChan.html',
            controller: 'submitVoteChanController',
            controllerAs: 'submitVoteChanCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Chancellor") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/oldMeeting/:role/:uid', {
            templateUrl: '/static/pages/viewOldMeetings.html',
            controller: 'oldMeetingsController',
            controllerAs: 'oldMeetingsCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Secretary") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/editUser/:role/:uid', {
            templateUrl: '/static/pages/editUser.html',
            controller: 'editUserController',
            controllerAs: 'editUserCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Administrator") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/Turns/:role/:uid', {
            templateUrl: '/static/pages/senator.html',
            controller: 'senatorController',
            controllerAs: 'senatorCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Senator") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/ChancellorTurns/:role/:uid', {
            templateUrl: '/static/pages/chancellor.html',
            controller: 'chancellorController',
            controllerAs: 'chancellorCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Chancellor") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/voting/:role/:uid', {
            templateUrl: '/static/pages/submitVote.html',
            controller: 'submitVoteController',
            controllerAs: 'submitVoteCtrl',
            resolve: {
                check: function ($q, authenticationSvc) {
                    var user = authenticationSvc.getUser();
                    if (user.role === "Senator") {

                    } else {
                        $q.reject({ authenticated: false });
                    }
                }
            }
        }).when('/monitor', {
            templateUrl: '/static/pages/monitor.html',
            controller: 'monitorController',
            controllerAs: 'monitorCtrl'
        }).otherwise({
            redirectTo: '/login'
        });
    }]);


    /**
     * Service that is shared across the Whitestone applications.
     * Authenticates a logged in user 
     */
    app.factory("authenticationSvc", ["$http", "$q", "$window", function ($http, $q, $window) {
        this.user;

        /**
         * Stores the users role and email in session storage to maintain the user
         * logged in
         * @param {string} email The user's email
         * @param {string} role The user's role
         */
        this.login = function (email, role) {
            this.user = {
                "email": email,
                "role": role
            };
            $window.sessionStorage.setItem("user", JSON.stringify(this.user));
        }

        /**
         * Removes the user from the session storage and logs out
         */
        this.logoutUser = function () {
            this.user = null;
            $window.sessionStorage.removeItem("user");
        }

        /**
         * Retrieves the current logged in user
         */
        this.getUser = function () {
            return this.user;
        }

        /**
         * Function to restore logged in user if page was refreshed
         */
        this.init = function () {
            if ($window.sessionStorage["user"]) {
                this.user = JSON.parse($window.sessionStorage.getItem("user"));

            }
        }

        return {
            getUser: this.getUser,
            login: this.login,
            logoutUser: this.logoutUser,
            init: this.init
        };
    }]);

    /**
     * Angular Module that is executed every time the application is loaded
     */
    app.run(["$rootScope", "$location", "authenticationSvc", function ($rootScope, $location, authenticationSvc) {
        authenticationSvc.init();

        $rootScope.$on("$routeChangeSuccess", function (user) {

        });
        $rootScope.$on("$routeChangeError", function (event, current, previous, eventObj) {

            if (eventObj.authenticated === false) {
                $location.url("/login");
            }
        });
    }]);

})();
