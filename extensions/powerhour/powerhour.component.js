(function(){
    angular.module('HtmlMusic')

    .component('powerhour', {
        controller: ['Events', 'Player', '$interval', function(Events, Player, $interval){
            var _this = this,
            timeInterval;
            _this.running = false;
            _this.started = false;
            // set this in options
            var options = {
                maxTime: 10,
                randomStart: true
            }

            _this.currentTime = 10;
            _this.currentIndex = 1;

            _this.$onInit = function(){
                Events.on('pause', function(){
                    _this.running = false;
                });
                Events.on('play', function(){
                    if(_this.started){
                        _this.running = true;
                    }
                });

                //Events.on('newPlaylistPlaying', endGame);
            }

            function onTick(){
                if(_this.running){
                    _this.currentTime--;
                    if(_this.currentTime == 0){
                        if(_this.currentIndex >= 60){
                            Player.stop();
                            //Events.trigger("stop");
                        }else{
                            _this.currentIndex++;
                        }
                        _this.currentTime = options.maxTime;
                        Events.trigger('next');
                    }
                }else{
                    Events.off('tick', onTick);
                }
            }

            _this.onDblClick = function(){
                console.log("double click");
                endGame();
            }

            function endGame(){
                _this.currentTime = options.maxTime;
                _this.started = false;
                _this.running = false;
            }

            function pause(){
                console.log("pause");
                //Events.trigger('toggle');
                Player.pause();
                _this.running = false;
            }

            function play(){
                if(!_this.started){
                    _this.started = true;
                    Events.trigger('startPlaylist');
                }

                _this.running = true;
                Player.play();
                Events.off('tick', onTick);
                Events.on('tick', onTick);
            }
            _this.onClick = function(){
                (_this.running ? pause : play)();
            }
        }],
        templateUrl: '../../extensions/powerhour/powerhour.html'
    });
})();
