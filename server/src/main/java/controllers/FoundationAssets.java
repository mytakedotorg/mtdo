/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.handlers.AssetHandler;

public class FoundationAssets implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.FOUNDATION, () -> views.Placeholder.foundation.template(""));
		env.router().get(Routes.FOUNDATION_V1 + "/:title/:videoRange", (req) -> {
			// Foundation video
			String titleSlug = req.param("title").value();
			String rangeStr = req.param("videoRange").value();
			String rangeArr[] = rangeStr.split("-");
			if (rangeArr.length != 2) {
				return NotFound.result();
			}
			String imgPath = Takes.vidImageUrl(titleSlug, rangeArr[0], rangeArr[1]);
			return views.Placeholder.foundation.template(imgPath);
		});
		env.router().get(Routes.FOUNDATION_V1 + "/:title/:hRange/:vRange", (req) -> {
			// Foundation document
			String titleSlug = req.param("title").value();
			String hRangeStr = req.param("hRange").value();
			String vRangeStr = req.param("vRange").value();
			String hRangeArr[] = hRangeStr.split("-");
			String vRangeArr[] = vRangeStr.split("-");
			if (hRangeArr.length != 2 || vRangeArr.length != 2) {
				return NotFound.result();
			}
			String imgPath = Takes.docImageUrl(titleSlug, hRangeArr[0], hRangeArr[1], vRangeArr[0], vRangeArr[1]);
			return views.Placeholder.foundation.template(imgPath);
		});
		// Foundation catch-all (nothing is highlighted)
		env.router().get(Routes.FOUNDATION_V1 + "/**", () -> views.Placeholder.foundation.template(""));
		env.router().assets(Routes.FOUNDATION_INDEX_HASH, new AssetHandler(Routes.FOUNDATION_INDEX_HASH).etag(false).maxAge(0));
		env.router().assets(Routes.FOUNDATION_DATA + "/*");
	}
}
