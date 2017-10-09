(function(){
    angular.module('HtmlMusic')
    .component('playlists', {
    	controller: [function(){

        }],
        template: `<div class="button" ng-click="$ctrl.toggleRepeat()"><i class="fa fa-backward" aria-hidden="true"></i></div>`
    )
})();
