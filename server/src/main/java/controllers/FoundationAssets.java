/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
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
