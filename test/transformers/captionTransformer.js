const captionLoader = require('../../loaders/caption-loader');

module.exports = {
	process(src, filename, config, options){
		return captionLoader(src);
	}
}
