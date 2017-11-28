package org.mytake.foundation;

import com.jsoniter.spi.Config;
import com.jsoniter.spi.JsoniterSpi;

public class JsonInit {
	public static void init() {
		Config config = new Config.Builder()
			.escapeUnicode(false)
			.build();
		JsoniterSpi.setDefaultConfig(config);
		JsoniterSpi.setCurrentConfig(config);
	}
}
