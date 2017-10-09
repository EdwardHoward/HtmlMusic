(function(){
    angular.module('HtmlMusic')
    .component('controls', {
        controller: ['Player', 'Events', function(Player, Events){
            var _this = this;
            _this.isPlaying = Player.isPlaying;

            // Toolbar buttons
    		_this.toggle = function(){
    			Events.trigger('toggle');
    		}
    		_this.prevSong = function(){
    			Events.trigger('prev');
    		}
    		_this.nextSong = function(){
    			Events.trigger('next');
    		}

        }],
        templateUrl: '../templates/controls.html'
    });
})();
