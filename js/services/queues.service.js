(function(){
    angular.module('HtmlMusic')
    .factory('Queues', [function(){
        var queueByName = {};

        var repeat = 0;
        // the current index in the unmodified playlist
        var currentIndex;
        class QueueType{
            constructor(name, init, nav){
                queueByName[name] = this;
                this.init = init;
            }

            setPlaylist(playlist){
                this.playlist = this.init ? this.init(playlist) : playlist;
            }

            getPlaylist(){
                return this.playlist;
            }

            getSongByIndex(index){
                return this.playlist[index];
            }

            getCurrentSong(){
                return this.playlist[this.index];
            }
            setCurrentIndex(index){
                currentIndex = index;
            }
            setIndex(index){
                this.index = index;
            }
            getIndex(){
                return this.index;
            }

            nav(dir){
                if(repeat < 2){
                    // default or repeat all
                    let opts = (dir == 'next' ?
                        {
                            add: 1,
                            bool: this.index >= this.playlist.length,
                            next: 0
                        } :
                        {
                            add: -1,
                            bool: this.index < 0,
                            next: this.playlist.length - 1
                        });

                    this.index += opts.add;
                    if(opts.bool){
                        if(repeat == 1){
                            return opts.next;
                        }else{
                            return -1;
                        }
                    }else{
                        currentIndex = this.playlist[this.index].index;
                        return this.index;
                    }
                }else{
                    // repeat one
                    return this.index;
                }
            }

            getNext(){
                return this.nav('next');
            }

            getPrev(){
                return this.nav('prev');
            }
        }


        new QueueType('Default', function(playlist){
            this.index = currentIndex;
            return playlist;
        });

        new QueueType('Shuffle', function(playlist){
            this.index = 0;
            function shuffleRand(b, a){
                while(a.length > 0){
                    b.push(a.splice(Math.round(Math.random() * (a.length - 1)), 1)[0]);
                }
            }
            var shuffled = [];
            shuffled.push(playlist.splice(currentIndex, 1)[0]);
            shuffleRand(shuffled, playlist);
            return shuffled;
        });

        return {
            getQueueByName: function(name){
                return queueByName[name];
            },
            getQueueTypes: function(){
                var a = [];
                for(var i in queueByName){
                    a.push(i);
                }
                return a;
            },
            setRepeat: function(re){
                repeat = re;
            },
            getRepeat: function(){
                return repeat;
            }
        }
    }]);
})();
