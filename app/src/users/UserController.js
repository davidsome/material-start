(function(){

  angular
       .module('users')
       .controller('UserController', [
          'userService', '$mdSidenav', '$mdBottomSheet', '$interval', '$log', '$http', 'API_URL', '$mdToast', '$scope', '$mdDialog',
          UserController
       ]);


  function UserController( userService, $mdSidenav, $mdBottomSheet, $interval, $log, $http, API_URL, $mdToast, $scope, $mdDialog ) {
    var self = this;

    self.selected     = null;
    self.rgs        = [ ];
    self.selectRg   = selectRg;
    self.addRg = addRg;
    self.toggleList   = toggleUsersList;
    self.makeContact  = makeContact;
    self.rpStart = rpStart;
    self.rpStop = rpStop;
      self.rgHB = rgHB;

    userService
          .loadrgAll
          .then( function( rgs ) {
            self.rgs    = [].concat(rgs);
            self.selected = self.rgs[0];
            for (var j=0;j<=self.rgs.length-1;j++){
                getRPS(self.rgs[j])
            }
            sse()
        });
    // *********************************
    // Internal methods
    // *********************************

    /**
     * Hide or Show the 'left' sideNav area
     */
    function toggleUsersList() {
      $mdSidenav('left').toggle();
    }

    /**
     * Select the current avatars
     * @param menuId
     */
        //        chart settings
    $scope.labels = ['', '', '', '', '', '', ''];
    var len = $scope.labels.length;
    $scope.series_traffic = ['totalUnZippedDataBytes', 'totalZippedDataBytes'];
    $scope.series_statistics = ['cmdSuccessCount', 'cmdFailedCount', 'cmdIgnoredCount'];
    $scope.series_statistics_delay = ['delay'];
    $scope.datasetOverride_traffic = [{ yAxisID: 'y-axis-1' }];
    $scope.datasetOverride_statistics = [{ yAxisID: 'y-axis-1' }];
    $scope.options_traffic = {
      scales: {
          yAxes: [
              {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
              }
          ]
      }
    };
     $scope.options_statistics = {
          scales: {
              yAxes: [
                  {
                      id: 'y-axis-1',
                      type: 'linear',
                      display: true,
                      position: 'left'
                  }
              ]
          }
      };

     function selectRg(rg){
         self.selected = rg
     }

      function sse (){
          if (typeof (EventSource) !== "undefined"){
//              server send events, one domain maximum 6 sockets
              var source_heartbeat = new EventSource(getRandomDomain() + '/sse/all/heartbeat');
              var source_stat = new EventSource(getRandomDomain() + '/sse/all/stat');
              var source_traffic = new EventSource(getRandomDomain() + '/sse/all/traffic');
              var source_statistics = new EventSource(getRandomDomain() + '/sse/all/statistics');
//listen
              source_heartbeat.onmessage = function (event) {
                  var a_data = JSON.parse(event.data);
                  for (var j=0;j<=self.rgs.length-1;j++){
                      for (var i=0;i<=self.rgs[j].rps.length-1;i++){
                          if (self.rgs[j].rps[i].data[0] == a_data.PairID){
                              if(a_data.BROKER != undefined){
                                  self.rgs[j].rps[i].sse.heartbeat.broker_time = HB_TIMEOUT;
                                  break
                              }
                              else if(a_data.DUPLICATOR != undefined){
                                  self.rgs[j].rps[i].sse.heartbeat.duplicator_time = HB_TIMEOUT;
                                  break
                              }
                          }
                      }
                }
                $scope.$apply();
              };

              source_traffic.onmessage = function (event) {
                  var a_data = JSON.parse(event.data);
                  for (var j=0;j<=self.rgs.length-1;j++){
                      for (var i=0;i<=self.rgs[j].rps.length-1;i++){
                          if (self.rgs[j].rps[i].data[0] == a_data.PairID) {
                              if (self.rgs[j].rps[i].sse.traffic[0].length >= len){
                                  self.rgs[j].rps[i].sse.traffic[0].shift();
                                  self.rgs[j].rps[i].sse.traffic[1].shift()
                              }
                              self.rgs[j].rps[i].sse.traffic[0].push(a_data.data.totalUnZippedDataBytes);
                              self.rgs[j].rps[i].sse.traffic[1].push(a_data.data.totalZippedDataBytes);
                              break
                          }
                      }
                  }
                  $scope.$apply();
              };

                source_statistics.onmessage = function (event) {
                    var a_data = JSON.parse(event.data);
                    for (var j=0;j<=self.rgs.length-1;j++){
                        for (var i=0;i<=self.rgs[j].rps.length-1;i++) {
                            if (self.rgs[j].rps[i].data[0] == a_data.PairID) {
                                if (self.rgs[j].rps[i].sse.statistics[0].length >=len){
                                    self.rgs[j].rps[i].sse.statistics[0].shift();
                                    self.rgs[j].rps[i].sse.statistics[1].shift();
                                    self.rgs[j].rps[i].sse.statistics[2].shift();
                                    self.rgs[j].rps[i].sse.statistics_delay[0].shift()
                                }
                                self.rgs[j].rps[i].sse.statistics[0].push(a_data.data.cmdSuccessCount);
                                self.rgs[j].rps[i].sse.statistics[1].push(a_data.data.cmdFailedCount);
                                self.rgs[j].rps[i].sse.statistics[2].push(a_data.data.cmdIgnoredCount);
                                self.rgs[j].rps[i].sse.statistics_delay[0].push(a_data.data.delay);
                                break
                            }
                        }
                    }
                    $scope.$apply();
                };

                source_stat.onmessage = function (event) {
                    var a_data  = JSON.parse(event.data);
                    for (var j=0;j<=self.rgs.length-1;j++){
                        for (var i=0;i<=self.rgs[j].rps.length-1;i++){
                            if (self.rgs[j].rps[i].data[0] == a_data.PairID) {
                                self.rgs[j].rps[i].sse.stat.push(a_data.data.message);
                                break
                            }
                        }
                    }
                    $scope.$apply();
                };
//                        source_stat.onerror = function (event){
//                            console.log(event);
//                            source_stat.close()
//                        };
          }else{
              alert("SSE not supported by browser")
          }
      }
    function rgHB(rg){
        for (var i=0;i<=rg.rps.length-1;i++){
            console.log(rg.rps)
            if (rg.rps[i].sse.heartbeat.broker_time < 0 || rg.rps[i].sse.heartbeat.duplicator_time < 0 ){
                return false
            }
        }
        return true
    }

    function getRPS ( rg ) {

        $http.get(API_URL['rgAction']+rg.id+'/pairs').success(function(data){
            rg.rps = [];
            for (var i=0;i<=data.length-1;i++){
                rg.rps[i] = {};
                rg.rps[i].data = data[i];
                rg.rps[i].sse = {};
                rg.rps[i].sse.stat = [];
                rg.rps[i].sse.stat_detail = false;
                rg.rps[i].sse.heartbeat = {};
                rg.rps[i].sse.heartbeat.broker = [];
                rg.rps[i].sse.heartbeat.broker_time = HB_TIMEOUT;
                rg.rps[i].sse.heartbeat.duplicator = [];
                rg.rps[i].sse.heartbeat.duplicator_time = HB_TIMEOUT;
                rg.rps[i].sse.traffic = [[],[]];
                rg.rps[i].sse.statistics = [[],[],[]];
                rg.rps[i].sse.statistics_delay = [[]];

                !function(i){
                    var timer = $interval(function(){
                        rg.rps[i].sse.heartbeat.broker_time--;
                        rg.rps[i].sse.heartbeat.duplicator_time--;
//                        console.log(i, rg.rps[i].sse.heartbeat.broker_time)
                    }, 1000);

                }(i);
            }
        });

    }

      function rpStart(rpID) {
          rg_http_action(API_URL["rpAction"]+rpID+"/run", {}, "POST");
      }

      function rpStop(rpID){
          rg_http_action(API_URL["rpAction"]+rpID+ "/kill", {}, "POST");
      }

      $http.get(API_URL['cms']).success(function(data){
          self.cms_items = data;
      });
      function addRg() {
          $mdBottomSheet.show({
              controllerAs: "vm",
              templateUrl:  "./src/users/view/rgCreate.html",
              controller:   [ '$mdBottomSheet', addRgController],
              parent: angular.element(document.getElementById("content"))
          }).then(function(clickedItem) {

          });

          function addRgController( $mdBottomSheet ) {
              this.cms_items = self.cms_items;

              this.chosen = function(){
                  angular.element(document.getElementById("srcSearchTerm")).on('keydown', function(ev) {
                      ev.stopPropagation();
                  });
                  angular.element(document.getElementById("destSearchTerm")).on('keydown', function(ev) {
                      ev.stopPropagation();
                  });
              };

              this.clearSearchTerm = function() {
                  this.srcSearchTerm = this.destSearchTerm = '';
              };

              this.rgCreate = function(action){
                  rg_http_action(API_URL['rgAction']+"?src="+this.src+"&dest="+this.dest, {'src': this.src, "dest": this.dest}, "POST");
//                  $http.post(API_URL['rgCreate'], {'src': this.src, "dest": this.dest}).success(function(data){
//                      console.log(data)
//                  });
                  $mdBottomSheet.hide(action);
              }
          }

      }
      function rg_http_action(url, data, method){
          var config = $mdToast.simple().position("top right");
          $http({
              url: url,
              data: data,
              method: method
          }).then(function successCallback(response){
              config.textContent(response.data.status+"    "+response.data.reason).highlightClass("md-accent")
              $mdToast.show(config);
              $log.debug(response)
          }, function errorCallback(response) {

          })
      }
    /**
     * Show the Contact view in the bottom sheet
     */
    function makeContact(rg) {

        $mdBottomSheet.show({
          controllerAs  : "vm",
          templateUrl   : './src/users/view/contactSheet.html',
          controller    : [ '$mdBottomSheet', rgActionController],
          parent        : angular.element(document.getElementById('content'))
        }).then(function(clickedItem) {
          $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * User ContactSheet controller
         */
        function rgActionController( $mdBottomSheet ) {
          this.rg = rg;
          this.items = [
            { name: 'start'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'kill'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'delete'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
          ];
          this.rgAction = function(action) {
            // The actually contact process has not been implemented...
            // so just hide the bottomSheet
              switch(action.name)
              {
                  case 'start':
                      rg_http_action(API_URL["rgAction"]+this.rg.id+"/"+action.name, {}, 'POST');
                      break;
                  case 'kill':
                      rg_http_action(API_URL["rgAction"]+this.rg.id+"/"+action.name, {}, 'POST');
                      break;
                  case 'delete':
                      rg_http_action(API_URL["rgAction"]+this.rg.id, {}, 'DELETE');
                      break;
                  default:
                      toastr.error("not supported")
              }
            $mdBottomSheet.hide(action);
          };
        }
    }

  }

})();
