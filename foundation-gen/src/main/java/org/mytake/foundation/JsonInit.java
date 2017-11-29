/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
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
