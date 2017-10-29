const foundationLoader = require('../../loaders/dist/foundation-loader');
const htmlLoader = require('html-loader');

module.exports = {
	process(src, filename, config, options){
		return htmlLoader(foundationLoader(src));
	}
}
