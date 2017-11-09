(function(){
    angular.module('HtmlMusic')
    .component('search', {
        controller: ['SongQueue', 'Events', '$timeout', function(SongQueue, Events, $timeout){
            var _this = this;
            _this.search = "";

            var timeout;
            _this.searchSubmit = function(){
                $timeout.cancel(timeout);
                timeout = $timeout(function(){
                    var playlist = SongQueue.getCurrentPlaylist();

                    var filtered = playlist.filter((item, index) => {
                        var matches = false;

                        if(item.title.toLowerCase().match(_this.search.toLowerCase())){
                            matches = true;
                        }

                        return matches;
                    });

                    Events.trigger('setPlaylist', filtered);
                }, 1000);
            }
        }],
        template: `<div id="search">
                        <input ng-model="$ctrl.search" />
                        <div class="button" ng-click="$ctrl.searchSubmit()"><i class="fa fa-search" aria-hidden="true"></i>
                        </div>
                    </div>`
    })
})();
