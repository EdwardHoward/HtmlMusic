(function(){

var	gui = require('nw.gui');

angular.module('config', [])
.constant('DB_CONFIG', {
	name: 'music',
	tables:[
		{
			name: 'playlists',
			columns:[
				{name: '_id', type: 'INTEGER PRIMARY KEY'},
				{name: 'name', type: 'varchar'}
			]
		},
		{
			name: 'songs',
			columns:[
				{name: '_id', type: 'INTEGER PRIMARY KEY'},
				{name: 'playlist_id', type: 'integer'},
				{name: 'path', type: 'varchar'},
				{name: 'title', type: 'varchar'},
				{name: 'tracknumber', type:'varchar'},
				{name: 'artist', type:'varchar'},
				{name: 'album', type: 'varchar'}
			]
		}
	]
})

//songs(_id INTEGER PRIMARY KEY, playlist_id, path, title VARCHAR, tracknumber VARCHAR, artist VARCHAR, album VARCHAR
var htmlMusic = angular.module('HtmlMusic', ['config'])
.run(function(DB){
	DB.init();
})

htmlMusic.directive('ngContextMenu', function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			element.bind('contextmenu', function(event){
				event.preventDefault();
				scope.$ctrl[attrs.ngContextMenu](event);
			});
		}
	}
})
.directive('ngFileChange', function(){
	return {
		restrict: 'A',
		link: function(scope, element, attrs){
			element.bind('change', function(event){
				event.preventDefault();
				scope.$ctrl[attrs.ngFileChange](event, element);
			});
		}
	}
})
.component('musicplayer', {
	controller: ['Events', 'Player', 'Playlists', 'Songs', function(Events, Player, Playlists, Songs){
		var _this = this;
		_this.fileInput;
		var currentPlaylist;
		_this.$onInit = function(){
			Events.on('songStart', function(){
				// Set the title of the window
				var metadata = Player.getMetadata();
				if(metadata){
					gui.Window.get().title = metadata.title + " - " + metadata.album;
				}
			});

			Events.on('playlistChange', function(playlist){
                console.log(playlist);
				currentPlaylist = playlist;
			});
		}

		_this.addSongs = function(event, element){
			if(!currentPlaylist){
				element.value = '';
			 	return;
			}
			let files = element[0].files;
            console.log(currentPlaylist);
			for(let i = 0; i < files.length; i++){
				let file = files[i];
				let asset = AV.Asset.fromFile(file);
				asset.get('metadata', function(data){
					var tracknumber = data.trackNumber == undefined ? data.tracknumber : data.trackNumber;
                    console.log(currentPlaylist);
					data.playlistId = currentPlaylist;
					data.path = file.path;
					data.tracknumber = tracknumber;
					if(currentPlaylist != undefined){
						Songs.insert(data).then(function(){
							Events.trigger('playlistChange', currentPlaylist);
						});
					}
				});
			}

			element.value = '';
		}

		// When the playlist list is right clicked
		// bring up context menu with New Playlist option
		// TODO: Rename, Delete
		var menu = new gui.Menu();
		menu.append(new gui.MenuItem({
			label: "New Playlist",
			click: function(){
				// TODO: This can't be a prompt because it makes music skip,
				// 		 Create custom dialog box
				var name = prompt("Playlist Name") || "New Playlist";
                if(name){
        			Playlists.insert(name || 'New Playlist').then(function(){
        				Events.trigger('newPlaylist');
        			})
                }
			}
		}));

		_this.openPlaylistMenu = function(playlist){
			menu.popup(event.x, event.y);
		}
	}],
	templateUrl: '../templates/musicplayer.html'
})
.component('time', {
	bindings:{
		update: '='
	},
	controller: ['Events', 'Player', function(Events, Player){
		var _this = this;
		_this.$onInit = function(){
			setTime();
			if(_this.update){
				Events.on('songStart', setTime);
			}

			Events.on('tick', onTick);
		}

		_this.$onDestroy = function(){
			Events.off('tick', onTick);
		}

		function onTick(){
			_this.currentTime = Player.getTimeString(Player.getCurrentTime());
		}

		function setTime(){
			_this.currentTime = "0:00";
			_this.durationTime = Player.getTimeString(Player.getDuration());
		}
	}],
	template: '<div class="time"><span id="currentTime">{{$ctrl.currentTime}}</span>/<span id="durationTime">{{$ctrl.durationTime}}</span></div>'
})

htmlMusic.factory('Events', [function(){
	var listeners = {};
	return{
		on: function(eventName, func){
			if(!listeners[eventName]) listeners[eventName] = [];
			listeners[eventName].push(func);
		},
		off: function(eventName, func){
			for(var i = 0; i < listeners[eventName].length; i++){
				if(listeners[eventName][i] == func){
					listeners[eventName][i] = null;
				}
			}
		},
		trigger: function(eventName, params){
			(listeners[eventName] || []).forEach(function(func){
				func && func(params);
			});
		}
	}
}])
.factory('DB', ['DB_CONFIG', '$q', function(DB_CONFIG, $q){
	var _this = this;
	_this.db;

	_this.init = function(){
		_this.db = openDatabase(DB_CONFIG.name, '1.0', 'Database for Music', 2 * 1024 * 1024);
		//_this.query('DROP TABLE songs');
		DB_CONFIG.tables.forEach(function(table){
			let columns = [];
			table.columns.forEach(function(column){
				columns.push(column.name + ' ' + column.type);
			});
			_this.query('CREATE TABLE IF NOT EXISTS ' + table.name + '(' + columns.join(',') +')');
		});
	}

	_this.query = function(query, bindings){
		var def = $q.defer();

		_this.db.transaction(function(tx){
			tx.executeSql(query, bindings, function(tx, res){
				def.resolve(res);
			}, function(tx, err){
				def.reject(err);
			})
		})

		return def.promise;
	}

	_this.fetchAll = function(res){
		var output = [];
		for(var i = 0; i < res.rows.length; i++){
			output.push(res.rows.item(i));
		}
		return output;
	}

	return _this;
}])

.factory('Playlists', ['DB', function(DB){
    var _this = this;

	_this.all = function(){
		return DB.query('SELECT * FROM playlists')
		.then(function(res){
			return DB.fetchAll(res);
		});
	}

	_this.insert = function(name){
		return DB.query('INSERT INTO playlists (name) VALUES (?)', [name])
		.then(function(res){
			return DB.fetchAll(res);
		});
	}

	return _this;
}])

.factory('Songs', ['DB', function(DB){
    var _this = this;

	_this.all = function(){
		return DB.query('SELECT * FROM songs ORDER BY album, ABS(tracknumber)')
		.then(function(res){
			return DB.fetchAll(res);
		});
	}

	_this.findByPlaylistId = function(playlistId){
		return DB.query('SELECT * FROM songs WHERE playlist_id=? ORDER BY album, ABS(tracknumber)', [playlistId+''])
		.then(function(res){
			return DB.fetchAll(res);
		})
	}

	_this.insert = function(data){
		return DB.query('INSERT INTO songs (playlist_id, path, title, tracknumber, artist, album) VALUES (?, ?, ?, ?, ?, ?)',
		[data.playlistId, data.path, data.title, data.tracknumber, data.artist, data.album]).then(function(res){
			return DB.fetchAll(res);
		});
	}

	return _this;
}])

.factory('Cookies', [function(){
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

    return {
        getCookie: function(name){
            return getCookie(name);
        },
        setCookie: function(name, value){
            setCookie(name, value, 20*365);
        }
    }
}])

.factory('Player', ['$q', 'Events', '$interval', function($q, Events, $interval){
	var player,
		timeInterval,
		volume,
		playing = false;

	function playFile(file, onSongEnd){
		var defer = $q.defer();

		var request = new XMLHttpRequest();
		request.open('GET', file, true);
		request.responseType = "arraybuffer";

		request.onload = function(){
			if(player) player.stop();
            player =
			player = AV.Player.fromBuffer(request.response);

			player.on('ready', function(){
				player.volume = volume;

				Events.trigger('songStart');
				Events.trigger('play');

				defer.resolve();
			});

			player.on('end', function(){
				$interval.cancel(timeInterval);
				Events.trigger('songEnd');
			});

			player.play();
		}
		request.send();

		return defer.promise;
	}

	var millisToTimeString = function(millis){
		let time = getTimeFromMillis(millis),
			timeStr = '';

		if(time.h > 0){
			timeStr += time.h +":";
			timeStr += (time.m < 10 ? "0" + time.m : time.m);
		}else{
			timeStr = time.m;
		}
		timeStr += ":"+(time.s < 10 ? "0" + time.s : time.s);

		return timeStr;

		function getTimeFromMillis(millis){
			let hours = ~~((millis / (1000 * 60 * 60)) % 24),
				minutes = ~~((millis / (1000 * 60)) % 60),
				seconds = ~~((millis / 1000) % 60);
			return {h: hours, m: minutes, s: seconds}
		}
	}

	function startInterval(){
        $interval.cancel(timeInterval);
		timeInterval = $interval(function(){
			if(!playing){
				$interval.cancel(timeInterval);
				return;
			}
			Events.trigger('tick')
		}, 1000);
	}

	return {
		playFile: function(file){
			playing = true;
			return playFile(file);
		},
		stop: function(){
			if(player){
				playing = false;
				player.stop();
				Events.trigger('stop');
			}
		},
        play: function(){
            if(player){
                if(!player.playing){
                    player.togglePlayback();
                    playing = true;
                    Events.trigger('play');
                }
            }
        },
        pause: function(){
            if(player){
                if(player.playing){
                    player.togglePlayback();
                    playing = false;
                    Events.trigger('pause');
                }
            }
        },
		toggle: function(){
			if(player){
				player.togglePlayback();
				playing = player.playing;
				Events.trigger(playing ? 'play' : 'pause');
			}
		},
		setVolume: function(vol){
			volume = vol;
			if(player){
				player.volume = volume;
			}
		},
		setTime: function(time){
			if(time < player.duration){
				player.seek(time);
			}
		},
		isPlaying: function(){
			return playing;
		},
		getDuration: function(){
			return player ? player.duration : 0;
		},
		getCurrentTime: function(){
			return player ? player.currentTime : 0;
		},
		getTimeString: function(time){
			return millisToTimeString(time);
		},
		getMetadata: function(){
			if(player){
				return player.metadata;
			}
		},
		startInterval: function(){
			startInterval();
		}
	}
}]);

})();
