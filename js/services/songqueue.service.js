// This is doing the same thing as Queues
(function(){
    angular.module('HtmlMusic')
    .factory('SongQueue', ['Songs', 'Queues', function(Songs, Queues){
        var currentSong, currentIndex, currentPlaylist;
        var queue;

        function setQueue(name){
            queue = Queues.getQueueByName(name);
        }

        return{
            setSongsByPlaylist(playlistId, func){
                queue.setPlaylist(playlistId);
            },

            setQueueType: function(name){
                setQueue(name);

                if(currentPlaylist){
                    queue.setPlaylist(currentPlaylist.slice());
                }
            },
            getQueueTypes: function(){
                return Queues.getQueueTypes();
            },
            getSongByIndex: function(index){
                return queue.getSongByIndex(index);
            },
            setQueueIndex: function(index){
                queue.setIndex(index);
            },
            setIndex: function(index){
                queue.setCurrentIndex(index);
            },
            setCurrentPlaylist: function(playlist){
                currentPlaylist = playlist.slice();
                queue.setPlaylist(playlist);
            },

            getCurrentPlaylist: function(){
                return currentPlaylist;
            },
            getCurrentSong: function(){
                var song = queue.getCurrentSong();
                return song;
            },
            getNext: function(random){
                return queue.getNext();
            },

            getPrev: function(){
                return queue.getPrev();
            }
        }

    }]);
})();
