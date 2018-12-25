var player = angular.module('player', []);
var basicMP3Player = new BasicMP3Player();

player.directive('songs',['$timeout', function($timeout) {
  var directiveDefinitionObject = {
    link: function (scope, iElement, iAttrs) {
        $timeout(function(){
            basicMP3Player.config['playNext'] = true
            basicMP3Player.config['autoPlay'] = true
            basicMP3Player.init()
        },1000)
     }
  };
  return directiveDefinitionObject;
}]);

player.controller('mainController',function ($scope, myService) {
    // when landing on the page, get all todos and show them
    myService.fetchPlayList().then(function(playList){
        myService.setList(playList)
        $scope.playlist = playList
    })

    $scope.play = function(mode){
        var target_index = 0;
        if (mode === 'loop') {
            basicMP3Player.loopPlay()
            return;            
        }

        if (mode === 'shuffle') {
            target_index = Math.floor(Math.random()*basicMP3Player.foundItems)
        }

        basicMP3Player.handleClick({target:basicMP3Player.links[target_index],preventDefault:function(){}});
        console.log(target_index)
        
    }
})

player.service('myService',function($http,$q){
      var _list = {};
      
      this.fetchPlayList = function(){
        var _deferred = $q.defer();
        $http({
          method: 'GET', 
          url: '/api/list'
        }).success(function(data, status, headers, config) {
          _deferred.resolve(data)
        }).error(function(data, status, headers, config) {
          _deferred.reject("There was an error")
          console.log(data, status, headers, config)
        });
        return _deferred.promise;
      }

      this.setList = function(list){
        _list = list;
      }

      this.getList = function(){
        return _list;
      }
    })