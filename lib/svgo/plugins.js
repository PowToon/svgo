'use strict';

/**
 * Plugins engine.
 *
 * @module plugins
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Object} plugins plugins object from config
 * @return {Object} output data
 */
module.exports = function(data, info, plugins) {

    plugins.forEach(function(group) {

        switch(group[0].type) {
            case 'perItem':
                data = perItem(data, info, group);
                break;
            case 'perItemReverse':
                data = perItem(data, info, group, true);
                break;
            case 'full':
                data = full(data, info, group);
                break;
        }

    });

    return data;

};

/**
 * Direct or reverse per-item loop.
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Array} plugins plugins list to process
 * @param {Boolean} [reverse] reverse pass?
 * @return {Object} output data
 */
function perItem(data, info, plugins, reverse) {
    //TODO: look at the readme
    var prefix = '';

    function monkeys(items) {

        items.content = items.content.filter(function(item) {

            // reverse pass
            if (reverse && item.content) {
                monkeys(item);
            }

            //TODO: look at the readme
            if(item.local === 'symbol'){
                prefix = item.attrs.id && item.attrs.id.value || '';
            }

            // main filter
            var filter = true;

            for (var i = 0; filter && i < plugins.length; i++) {
                var plugin = plugins[i];
                var params = plugin.params || {}

                //TODO: look at the readme
                if(params.prefix === true){
                    params = Object.assign({}, params, {
                        //Don't prefix ids
                        prefix: (item.local === 'symbol' || item.local === 'use') ?
                            '' : prefix
                    });
                }

                if (plugin.active && plugin.fn(item, params, info) === false) {
                    filter = false;
                }
            }

            // direct pass
            if (!reverse && item.content) {
                monkeys(item);
            }

            return filter;

        });

        return items;

    }

    return monkeys(data);

}

/**
 * "Full" plugins.
 *
 * @param {Object} data input data
 * @param {Object} info extra information
 * @param {Array} plugins plugins list to process
 * @return {Object} output data
 */
function full(data, info, plugins) {

    plugins.forEach(function(plugin) {
        if (plugin.active) {
            data = plugin.fn(data, plugin.params, info);
        }
    });

    return data;

}
