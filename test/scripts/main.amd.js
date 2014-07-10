require.config({
    baseUrl: 'scripts/vendor',
    paths: {
        jquery: 'jquery-1.11.1'
    }
});

require(['jquery', '../dist/jquery.dragger.amd.js'], function ($, Dragger) {

    'use strict';

    var normal = new Dragger('.normal', {
        drag: function (pos) {
            this.$el.find('img').css({ transform: 'translate('+pos.x+'px,'+pos.y+'px)' });
        }
    });

    var plugin = $('.plugin').Dragger({
        drag: function (pos) {
            this.$el.find('img').css({ transform: 'translate('+pos.x+'px,'+pos.y+'px)' });
        }
    });

});