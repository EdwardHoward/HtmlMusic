(function(){
    angular.module('HtmlMusic')
    .component('volume', {
        controller: ['Player', 'Cookies', function(Player, Cookies){
            var _this = this;

            _this.volume = 100;
            _this.$onInit = function(){
                _this.volume = Cookies.getCookie('volume');
                Player.setVolume(_this.volume);
            }

            _this.setVolume = function(){
                Cookies.setCookie('volume', _this.volume);
                Player.setVolume(_this.volume);
            }
        }],
        templateUrl: '../templates/volume.html'
    });
})();
