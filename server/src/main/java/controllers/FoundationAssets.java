/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import java2ts.Routes;
import jsweet.util.tuple.Tuple2;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.handlers.AssetHandler;

public class FoundationAssets implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.FOUNDATION, () -> views.Placeholder.foundation.template());
		env.router().get(Routes.FOUNDATION_V1 + "/:title/:videoRange", (req) -> {
			// Foundation video
			String title = req.param("title").value();
			String rangeStr = req.param("videoRange").value();
			Tuple2<Float, Float> range = Shares.rangeFromString(rangeStr);
			if (range != null) {
				// TODO: create image path and pass to template
			}
			return views.Placeholder.foundation.template();
		});
		env.router().get(Routes.FOUNDATION_V1 + "/:title/:hRange/:vRange", (req) -> {
			// Foundation document
			String title = req.param("title").value();
			String hRangeStr = req.param("hRange").value();
			String vRangeStr = req.param("vRange").value();
			Tuple2<Float, Float> hRange = Shares.rangeFromString(hRangeStr);
			Tuple2<Float, Float> vRange = Shares.rangeFromString(vRangeStr);
			if (hRange != null && vRange != null) {
				// TODO: create image path and pass to template
			}
			return views.Placeholder.foundation.template();
		});
		// Foundation catch-all (nothing is highlighted)
		env.router().get(Routes.FOUNDATION_V1 + "/**", () -> views.Placeholder.foundation.template());
		env.router().assets(Routes.FOUNDATION_INDEX_HASH, new AssetHandler(Routes.FOUNDATION_INDEX_HASH).etag(false).maxAge(0));
		env.router().assets(Routes.FOUNDATION_DATA + "/*");
	}
}
