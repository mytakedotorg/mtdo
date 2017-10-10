const captionLoader = require('../../loaders/dist/sbv-loader');

module.exports = {
	process(src, filename, config, options){
		return captionLoader(src);
	}
}
