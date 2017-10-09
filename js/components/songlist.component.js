(function(){
    angular.module('HtmlMusic')
    .component('songlist', {
    	controller: ['Songs', 'SongQueue', 'Events', 'Player', 'Cookies', function(Songs, SongQueue, Events, Player, Cookies){
    		var _this = this;

    		_this.selectedPlaylist;
            var currentlyPlayingPlaylist;

            function getSongsByPlaylist(playlistId){
                Songs.findByPlaylistId(playlistId).then(function(res){
                    _this.selectedPlaylist = playlistId;
                    _this.songs = res.map(function(a, index){
                        a['index'] = index;
                        return a;
                    });

                    if(!SongQueue.getCurrentPlaylist()){
                        SongQueue.setCurrentPlaylist(_this.songs);
                    }
                });
            }

    		_this.$onInit = function(){

                getSongsByPlaylist(Cookies.getCookie('playlist'));

    			Events.on('playlistChange', function(playlistId){

                    getSongsByPlaylist(playlistId);
                });

    			Events.on('stop', function(){
    				_this.currentlyPlaying = null;
    			});

    			Events.on('toggle', function(){
    				if(_this.currentlyPlaying){
    					Player.toggle();
    				}else{
                        startPlaylist();
    				}
    			});

                Events.on('setPlaylist', function(newPlaylist){
                    _this.songs = newPlaylist;
                });

                Events.on('startPlaylist', startPlaylist);

    			Events.on('next', function(){
    				playDir('next');
    			});

    			Events.on('prev', function(){
    				playDir('prev');
    			});

    			Events.on('songEnd', function(){
    				playDir('next');
    			});
    		}

    		_this.select = function(elem){
    			_this.selected = elem;
    		}

    		_this.playSong = function(index, setPlaylist){
                SongQueue.setQueueIndex(index);
                var playlist = SongQueue.getCurrentPlaylist();
                if(!playlist || (setPlaylist && _this.songs[index] != playlist[index])){
                    SongQueue.setIndex(index);
                    Events.trigger('newPlaylistPlaying');
                    SongQueue.setCurrentPlaylist(_this.songs.slice());
                }

                var song = SongQueue.getCurrentSong();
    			Player.playFile(song.path).then(function(){
    				_this.currentlyPlaying = song;
    			});
    		}

            function play(){

            }

            function pause(){

            }


    		function playDir(dir){
                var newIndex = SongQueue[dir == 'next' ? 'getNext' : 'getPrev']();
                if(newIndex > -1){
                    _this.playSong(newIndex);
                }else{
                    Player.stop();
                }
    		}

            function startPlaylist(){
                if(_this.selected){
                    _this.playSong(_this.selected.$index);
                }else{
                    _this.playSong(0);
                }
            }
    	}],
    	templateUrl: '../templates/songlist.html'
    });
})();
