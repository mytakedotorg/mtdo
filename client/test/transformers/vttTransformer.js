const captionLoader = require('../../loaders/dist/vtt-loader');

module.exports = {
	process(src, filename, config, options){
		return captionLoader(src);
	}
}
