/// <reference path="~/Scripts/Angular.js" />


(function () {
    "use strict";

    // Define your library strictly...
    var publicApp = angular.module('publicApp', ['ngRoute', 'publicApp.createRequest', 'publicApp.myRequest', 'publicApp.myFunction']);

    publicApp.config(function ($routeProvider, $locationProvider) {
        // Specify the three simple routes ('/', '/About', and '/Contact')
        $routeProvider.when('/', {
            templateUrl: '/Home/Home',
            //controller: 'homeCtrl',
            title: 'Home'
        });
        $routeProvider.when('/CreateRequest', {
            templateUrl: '/Home/CreateRequest',
            controller: 'createRequestCtrl',
            title: 'Create Request'
        });
        $routeProvider.when('/MyRequest', {
            templateUrl: '/Home/MyRequest',
            controller: 'myRequestCtrl',
            title: 'My Request'
        });
        $routeProvider.when('/MyFunction', {
            templateUrl: '/Home/MyFunction',
            controller: 'myFunctionCtrl',
            title: 'My Function'
        });

        $routeProvider.otherwise({
            redirectTo: '/'
        });

        // Specify HTML5 mode (using the History APIs) or HashBang syntax.
        $locationProvider.html5Mode(false).hashPrefix('!');
    })
    .run(['$location', '$rootScope', function ($location, $rootScope) {
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.pageTitle = current.$$route.title;
        });
    }]);
    publicApp.service('signalRSvc', ['signalRHubProxy', function (signalRHubProxy) {
        var initiated = false;
        var proxy = undefined;
        return {
            isInitiated: function () { return initiated; },
            setInitiated: function () { initiated = true; },
            init: function (callback) {
                proxy = signalRHubProxy(
             'eventServiceChatHub',
                 { logging: true }, function () {
                     initiated = true;
                     if (callback != null)
                         callback();
                 });
                return proxy;
            },
            getProxy: function () {
                return proxy;
            }
        };
    }]);

    publicApp.value('$', $);

    publicApp.factory('signalRHubProxy', ['$', '$rootScope', function ($, $rootScope) {
        function signalRHubProxyFactory(hubName, startOptions, startUpCallback) {
            var connection = $.hubConnection('http://localhost:55655/signalr');
            var proxy = connection.createHubProxy(hubName);
            proxy.on('broadCastMessage', function (groupName, name, message) {
                $rootScope.$emit("broadCastMessage", groupName, name, message);
            });
            connection.start(startOptions).done(function () {
                if (startUpCallback != null) {

                    startUpCallback();

                }
            }).fail(function (error) {
                alert(error);
            });

            return {
                on: function (eventName, callback) {
                    //alert(eventName);
                    proxy.on(eventName, function (result1, result2, result3) {
                        //alert(result1);
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result1, result2, result3);
                            }
                        });
                    });
                },

                off: function (eventName, callback) {
                    proxy.off(eventName, function (result) {
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                },
                invoke: function (methodName, parameter, callback) {
                    proxy.invoke(methodName, parameter)
                        .done(function (result) {
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        }).fail(function (error) {
                            alert(error);
                        });
                },
                invoke3: function (methodName, parameter1, parameter2, parameter3, callback) {
                    proxy.invoke(methodName, parameter1, parameter2, parameter3)
                        .done(function (result) {
                            //alert(result);
                            $rootScope.$apply(function () {
                                //alert(result);
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                },
                connection: connection
            };
        };

        return signalRHubProxyFactory;
    }]);
    publicApp.controller('SignalRAngularCtrl', ['$scope', 'signalRSvc', function ($scope, signalRSvc) {
        $scope.text = "";

        $scope.disName = ""; $scope.grpName = "";
        var clientPushHubProxy = undefined;
        $scope.progress = true;

        $scope.isGroupJoined = false;
        $scope.isChatInitiated = false;
        $scope.chatMessages = [];

        if (signalRSvc.isInitiated()) {
            clientPushHubProxy = signalRSvc.getProxy();
            $scope.joinGroup();
        }
        else {
            clientPushHubProxy = signalRSvc.init(function () {
                $scope.joinGroup();
            });
        }

        $scope.joinGroup = function () {
            $scope.progress = true;
            //alert($scope.grpName1);
            clientPushHubProxy.invoke('joinGroup', $scope.grpName, function () {
                $scope.progress = false;
                $scope.isGroupJoined = true;
                //clientPushHubProxy.on('broadCastMessage', $scope.broadCastMessage());

            });
        };
        $scope.$parent.$on("broadCastMessage", function (e, groupName, name, message) {
            $scope.$apply(function () {
                $scope.broadCastMessageAll(groupName, name, message)
            });
        });
        $scope.broadCastMessageAll = function (groupName, name, message) {
            $scope.progress = true;
            $scope.isChatInitiated = true;
            var msg = { gname: groupName, dname: name, mes: message };
            $scope.chatMessages.push(msg);
        };
        $scope.sendMessage = function () {
            $scope.progress = true;
            clientPushHubProxy.invoke3('send', $scope.grpName, $scope.disName, $scope.text, function () { $scope.text = ''; });
        };
    }]);

    function htmlEncode(value) {
        var encodedValue = $('<div />').text(value).html();
        return encodedValue;
    }
})();