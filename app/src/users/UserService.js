(function(){
  'use strict';

  angular.module('users')
         .service('userService', ['$q', '$http', 'API_URL', UserService])
      .filter("rg_hb", function(){
          return function(rg){
              for (var i=0;i<=rg.rps.length-1;i++){
                  if (rg.rps[i].sse.heartbeat.broker_time < 0 || rg.rps[i].sse.heartbeat.duplicator_time < 0 ){
                      return false;
                  }
              }
              return true;
          }
      })
  ;

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
