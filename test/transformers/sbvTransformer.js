const captionLoader = require('../../loaders/sbv-loader');

module.exports = {
	process(src, filename, config, options){
		return captionLoader(src);
	}
}
