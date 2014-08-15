({
    dir: '_build',
    appDir: '.',
    baseUrl: 'src',
    mainConfigFile: 'src/main.js',
    findNestedDependencies: true,
    // doesn't handle plugin resources
    removeCombined: true,
    skipDirOptimize: true,
    optimize: 'uglify2',
    preserveLicenseComments: false,
    // Everything to do with CSS is handled by the require-css plugin
    optimizeCss: 'none',
    inlineText: true,
    stubModules: [
        'text', 
        'tpl', 
        'css', 
        'json', 
        'less'
    ],
    pragmasOnSave: {
        excludeRequireCss: true,
        excludeTpl: true
    },
    /** 
     * An attempt to solve the eternal optimization problem of how to bundle
     * components and dependencies together so they will load the fastest for
     * the most users, given variables such as
     *   - the overhead of an HTTP request
     *   - the browser cache
     *   - the rate of changes to files
     *
     * This is a configuration for the optimizer that's meaningless for the
     * asynchronous loader, but we put it here because we generate the
     * 'bundles' config that is used by the asynchronous loader from it, and
     * it's not possible to represent all of this information using bundles.
     *
     * NOTE bundles.js may need to be updated if modules are changed
     */
    modules: [
        // Build-only dependencies that should be excluded from all built
        // modules
        {
            create: true,
            name: 'exclude',
            include: [
                'css/normalize',
                'less/normalize'
            ]
        },
        // Global dependencies that may be already loaded on the page.  If
        // any aren't, then a single file containing them all will be
        // requested once.
        //
        // If bootstrap is already loaded, and you load this bundle,
        // you're going to have a bad time.
        {
            create: true,
            name: 'global-deps',
            include: [
                'jquery',
                'jquery-ui',
                'jquery.bootstrap',

                // shim plugin dependencies don't get automatically included
                'css/css!../lib/jquery-ui/redmond/jquery-ui-1.8.14.custom'
            ],
            exclude: [
                'exclude'
            ]
        },
        // Components (and their dependencies) that can be requested
        // asynchronously after Vellum has already finished loading, because
        // they're not necessary for initial operation.

//        // At the moment, this bundle doesn't get used as expected.
//        {
//            create: true,
//            name: 'deferred-components',
//            include: [
//                // core
//                'codemirror',
//                'diff-match-patch',
//                'CryptoJS',
//                'vellum/expressionEditor',
//
//                // uploader
//                'file-uploader',
//
//                // form
//                'vellum/writer',
//                'vellum/exporter'
//            ],
//            exclude: [
//                'exclude',
//                'global-deps',
//                // required by things other than the expression editor, ensure
//                // that they're not bundled here, otherwise separate bundles
//                // is useless
//                'xpath',
//                'vellum/util'
//            ]
//        },

        // Local dependencies that don't change often, except for new ones being
        // added.
        {
            create: true,
            name: 'local-deps',
            include: [
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
            exclude: [
                'exclude',
                'global-deps', 
                //'deferred-components'
            ]
        },
        // Everything else except main.
        {
            create: true,
            name: 'main-components',
            include: ['main'],
            exclude: [
                'exclude',
                'global-deps', 
                //'deferred-components', 
                'local-deps'
            ]
        }
    ]
})
