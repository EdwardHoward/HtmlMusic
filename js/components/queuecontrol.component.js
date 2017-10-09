(function(){
    angular.module('HtmlMusic')

    .component('queuecontrol', {
        controller: ['Cookies', 'SongQueue', function(Cookies, SongQueue){
            var _this = this;
            this.$onInit = function(){
                _this.queueTypes = SongQueue.getQueueTypes();
                _this.queueType = Cookies.getCookie('queueType') || _this.queueTypes[0];

                SongQueue.setQueueType(_this.queueType);
            }

            _this.onChange = function(queueType){
                Cookies.setCookie('queueType', queueType);
                SongQueue.setQueueType(queueType);
            }
        }],
    	templateUrl: '../templates/queuecontrol.component.html'
    });
})();
