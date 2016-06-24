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
    self.showStatDetail = showStatDetail;

    userService
          .loadrgAll
          .then( function( rgs ) {
            self.rgs    = [].concat(rgs);
//            self.selected = rgs[0];
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

     function showStatDetail(i){
         var parentEl = angular.element(document.body);
         $mdDialog.show({
             parent: parentEl,
             controller: showStatDetailCtrl
         });

         function showStatDetailCtrl(){

         }

     }

    function selectRg ( rg ) {
        self.selected = rg;

        $http.get(API_URL['rgAction']+rg.id+'/pairs').success(function(data){
            self.selected.rps = [];
            for (var i=0;i<=data.length-1;i++){
                self.selected.rps[i] = {};
                self.selected.rps[i].data = data[i];
                self.selected.rps[i].sse = {};
                self.selected.rps[i].sse.stat = [];
                self.selected.rps[i].sse.stat_detail = false;
                self.selected.rps[i].sse.heartbeat = {};
                self.selected.rps[i].sse.heartbeat.broker = [];
                self.selected.rps[i].sse.heartbeat.broker_time = HB_TIMEOUT;
                self.selected.rps[i].sse.heartbeat.duplicator = [];
                self.selected.rps[i].sse.heartbeat.duplicator_time = HB_TIMEOUT;
                self.selected.rps[i].sse.traffic = [[],[]];
                self.selected.rps[i].sse.statistics = [[],[],[]];

                !function(i){
                    if (typeof (EventSource) !== "undefined"){
                        var source_heartbeat = new EventSource(getRandomDomain() + '/sse/'+data[i][0]+'/heartbeat');
                        var source_stat = new EventSource(getRandomDomain() + '/sse/'+data[i][0]+'/stat');
                        var source_traffic = new EventSource(getRandomDomain() + '/sse/'+data[i][0]+'/traffic');
                        var source_statistics = new EventSource(getRandomDomain() + '/sse/'+data[i][0]+'/statistics');

                        var timer = $interval(function(){
                            self.selected.rps[i].sse.heartbeat.broker_time--;
                            self.selected.rps[i].sse.heartbeat.duplicator_time--;
                            console.log(i, self.selected.rps[i].sse.heartbeat.broker_time)
                        }, 1000);

                        source_heartbeat.onmessage = function (event) {
                            var hb_data = event.data.split(",");
                            if (hb_data[0] == "BROKER"){
                                self.selected.rps[i].sse.heartbeat.broker_time = HB_TIMEOUT;
                                self.selected.rps[i].sse.heartbeat.broker.push(event.data);
                            }
                            if (hb_data[0] == "DUPLICATOR"){
                                self.selected.rps[i].sse.heartbeat.duplicator_time = HB_TIMEOUT;
                                self.selected.rps[i].sse.heartbeat.duplicator.push(event.data);
                            }
//                            $log.debug(self.selected.rps[i].sse.heartbeat);
                            $scope.$apply();
                        };

                        source_stat.onmessage = function (event) {
                            self.selected.rps[i].sse.stat.push(event.data);
                            console.log(self.selected.rps[i].sse.stat)
                            $scope.$apply();
                        };
                        source_stat.onerror = function (event){
                            console.log(event);
                            source_stat.close()
                        };

                        source_traffic.onmessage = function (event) {
                            if (self.selected.rps[i].sse.traffic[0].length >= len){
                                self.selected.rps[i].sse.traffic[0].shift()
                                self.selected.rps[i].sse.traffic[1].shift()
                            }
                            self.selected.rps[i].sse.traffic[0].push(JSON.parse(event.data).totalUnZippedDataBytes);
                            self.selected.rps[i].sse.traffic[1].push(JSON.parse(event.data).totalZippedDataBytes);
                            $log.debug(self.selected.rps[i].sse.traffic);
                            $scope.$apply();
                        };

                        source_statistics.onmessage = function (event) {
                            if (self.selected.rps[i].sse.statistics[0].length >=len){
                                self.selected.rps[i].sse.statistics[0].shift()
                                self.selected.rps[i].sse.statistics[1].shift()
                                self.selected.rps[i].sse.statistics[2].shift()
                            }
                            self.selected.rps[i].sse.statistics[0].push(JSON.parse(event.data).cmdSuccessCount);
                            self.selected.rps[i].sse.statistics[1].push(JSON.parse(event.data).cmdFailedCount);
                            self.selected.rps[i].sse.statistics[2].push(JSON.parse(event.data).cmdIgnoredCount);
                            $log.debug(self.selected.rps[i].sse.statistics);
                            $scope.$apply();
                        };

                    }else{
                        alert("SSE not supported by browser")
                    }
                    console.log(self.selected.rps)

                }(i)
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
                  rg_http_action(API_URL['rgAction'], {'src': this.src, "dest": this.dest}, "POST");
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
              config.textContent(response.data.status+response.data.reason).highlightClass("md-accent")
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
