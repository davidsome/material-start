(function(){

  angular
       .module('users')
       .controller('UserController', [
          'userService', '$mdSidenav', '$mdBottomSheet', '$timeout', '$log', '$http', 'API_URL',
          UserController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function UserController( userService, $mdSidenav, $mdBottomSheet, $timeout, $log, $http, API_URL ) {
    var self = this;

    self.selected     = null;
    self.rgs        = [ ];
    self.selectRg   = selectRg;
    self.addRg = addRg;
    self.toggleList   = toggleUsersList;
    self.makeContact  = makeContact;
    self.rpStart = rpStart;
      self.rpStop = rpStop;

    // Load all registered users

    userService
          .loadrgAll
          .then( function( rgs ) {
            self.rgs    = [].concat(rgs);
            self.selected = rgs[0];
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
    function selectRg ( rg ) {
        self.selected = rg;

//        $http.get(API_URL['rpList']+rg.id+'/pairs').success(function(data){
            self.selected.rp = [
                [
                    "4dfc3f97-e06a-4d59-9de4-478c5b98ed68",
                    {
                        "source": "10.2.25.235:6379",
                        "destination": "HotelFarmHouseService"
                    }
                ],
                [
                    "4dfc3f97-e06a-4d59-9de4-478c5b98ed68",
                    {
                        "source": "10.2.25.235:6379",
                        "destination": "HotelFarmHouseService"
                    }
                ],
            ]

//        });
    }

      function rpStart(rpID) {
          $http.post(API_URL["rpAction"]+rpID+"/run").success(function(){

          })
      }

      function rpStop(rpID){
          $http.post(API_URL["rpAction"]+rpID+ "/kill").success(function(){

          })
      }
      function addRg() {
          $mdBottomSheet.show({
              controllerAs: "vm",
              templateUrl:  "./src/users/view/rgCreate.html",
              controller:   [ '$mdBottomSheet', addRgController],
              parent: angular.element(document.getElementById("content"))
          }).then(function(clickedItem) {

          });

          function addRgController( $mdBottomSheet ) {
              $http.get(API_URL['cms']).success(function(data){
                  this.cms_items = data;
              });
              this.cms_items = [{Name: 'asdfsdf'}, {Name: 'asdfsdf2434'}, {Name: 'cv'}, {Name: 'sd'}, {Name: 'sa24'}, {Name: 'v46'}];

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
                  $http.post(API_URL['rgCreate'], {'src': this.src, "dest": this.dest}).success(function(data){
                      console.log(data)
                  });
                  $mdBottomSheet.hide(action);
              }
          }

      }

    /**
     * Show the Contact view in the bottom sheet
     */
    function makeContact(rg) {

        $mdBottomSheet.show({
          controllerAs  : "vm",
          templateUrl   : './src/users/view/contactSheet.html',
          controller    : [ '$mdBottomSheet', ContactSheetController],
          parent        : angular.element(document.getElementById('content'))
        }).then(function(clickedItem) {
          $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * User ContactSheet controller
         */
        function ContactSheetController( $mdBottomSheet ) {
          this.rg = rg;
            console.log(rg)
          this.items = [
            { name: 'start'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'kill'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'delete'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
          ];
          this.contactUser = function(action) {
            // The actually contact process has not been implemented...
            // so just hide the bottomSheet
              switch(action.name)
              {
                  case 'start':
                      rg_http_action(API_URL["rgStart"], {}, 'POST');
                      break;
                  case 'kill':
                      rg_http_action(API_URL["rgKill"], {}, 'POST');
                      break;
                  case 'delete':
                      rg_http_action(API_URL["rgDelete"], {}, 'DELETE');
                      break;
                  default:
                      toastr.error("not supported")
              }
            $mdBottomSheet.hide(action);
          };
        }

//        action
        function rg_http_action(url, data, method){
            $http({
                url: url,
                data: data,
                method: method
            }).then(function successCallback(response){
                console.log(response)
            }, function errorCallback(response) {

            }).error(function(){
                toastr.error("下发异常")
            })
        }
    }

  }

})();
