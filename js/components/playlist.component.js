(function(){
    angular.module('HtmlMusic')
    .component('playlists', {
    	controller: ['Playlists', 'Events', 'Cookies', function(Playlists, Events, Cookies){
    		var _this = this;
    		_this.$onInit = function(){
    			Playlists.all().then(function(res){
    				_this.playlists = res;
    			});

    			Events.on('newPlaylist', function(playlist){
    				Playlists.all().then(function(res){
    					_this.playlists = res;
    				});
    			});

                _this.getSongs(Cookies.getCookie('playlist'));
    		}


    		_this.getSongs = function(playlistId){
    			_this.selectedPlaylist = playlistId;
                Cookies.setCookie('playlist', playlistId);
    			Events.trigger('playlistChange', playlistId);
    		}
    	}],
    	templateUrl: '../templates/playlists.html'
    })
})();
