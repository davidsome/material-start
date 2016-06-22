(function(){
  'use strict';

  angular.module('users')
         .service('userService', ['$q', '$http', 'API_URL', UserService]);

  /**
   * Users DataService
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function UserService($q, $http, API_URL){

    var getService = function (url, args){
        var deferred = $q.defer();
        $http.get(url, args)
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function (error) {
                deferred.reject(error);
            });
        return $q.when(deferred.promise);
    };

    // Promise-based API
    return {
        loadrgAll : getService(API_URL['rgAll'], {})
    };
  }

})();
