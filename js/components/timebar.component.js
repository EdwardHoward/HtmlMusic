(function(){
    angular.module('HtmlMusic')
        .component('timebar', {
        	controller: ['Events', 'Player', function(Events, Player){
        		var _this = this;
                
        		_this.$onInit = function(){
        			Events.on('songStart', function(){
        				_this.max = Player.getDuration();
        				timebar.value = 0;
        			});

        			// TODO: start the interval somewhere else (like in the Player)
        			Events.on('play', function(){
        				Player.startInterval();
        			});

        			Events.on('tick', function(){
        				timebar.value = Player.getCurrentTime();
        			});
        		}

        		_this.seek = function(){
        			Player.setTime(timebar.value);
        		};
        	}],
        	templateUrl: '../templates/timebar.html'

        });
})();
