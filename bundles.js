// TODO auto-generate this file from modules in build.js during build
require.config({
    paths: {
        vellum: "."
    },
    bundles: {
        'global-deps': [
            'jquery',
            'jquery-ui',
            'jquery.bootstrap',

            // shim plugin dependencies don't get automatically included
            'css/css!../lib/jquery-ui/redmond/jquery-ui-1.8.14.custom'
        ],
        'local-deps': [
            'underscore',
            'jquery.jstree',
            'jquery.fancybox',
            'jquery.bootstrap-popout',
            'jquery.bootstrap-better-typeahead',
            'save-button',

            // shim plugin dependencies don't automatically get included
            'css/css!../lib/codemirror/codemirror',
            'css/css!../lib/jstree/default/style',
            'css/css!../lib/fancybox/jquery.fancybox-1.3.4',
        ],
        'main-components': [
            'vellum/core',
            'vellum/ignoreButRetain',
            'vellum/intentManager',
            'vellum/itemset',
            'vellum/javaRosa',
            'vellum/lock',
            'vellum/uploader',
            'vellum/window',
            'vellum/polyfills'
        ]
    }
});

define([
    'jquery',
    'vellum/core',
    'vellum/ignoreButRetain',
    'vellum/intentManager',
    'vellum/itemset',
    'vellum/javaRosa',
    'vellum/lock',
    'vellum/uploader',
    'vellum/window',
    'vellum/polyfills'
], function () {});
