const foundationLoader = require('../loaders/foundation-loader');
const htmlLoader = require('html-loader');

module.exports = {
	process(src, filename, config, options){
		return htmlLoader(foundationLoader(src));
	}
}
