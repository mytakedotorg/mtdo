/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
package common;

import com.diffplug.common.base.Errors;
import com.fizzed.rocker.RockerTemplate;
import com.fizzed.rocker.RockerTemplateCustomizer;
import com.fizzed.rocker.runtime.DefaultRockerModel;
import com.fizzed.rocker.runtime.StringBuilderOutput;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.util.HashMap;
import java.util.List;
import java.util.function.BiFunction;
import org.jooby.assets.AssetCompiler;

public abstract class CustomRockerModel extends DefaultRockerModel {
	/** Renders this model to a string. */
	public String renderToString() {
		return render(StringBuilderOutput.FACTORY).toString();
	}

	public String renderTest() {
		return super.doRender(null, StringBuilderOutput.FACTORY, new RockerTemplateCustomizer() {
			@Override
			public void customize(RockerTemplate templateRaw) {
				try {
					CustomRockerTemplate template = (CustomRockerTemplate) templateRaw;

					// make assets.conf work
					template.locals = new HashMap<>();
					Config config = ConfigFactory.parseResources("assets.conf");
					AssetCompiler compiler = new AssetCompiler(config);
					BiFunction<String, String, String> url = (type, raw) -> "/assets-dev/" + type + raw;
					List<String> keyValue = CustomAssets.keyValueFor(compiler, url);
					for (int i = 0; i < keyValue.size() / 2; ++i) {
						String key = keyValue.get(2 * i);
						String value = keyValue.get(2 * i + 1);
						template.locals.put(key, value);
					}
				} catch (Throwable e) {
					throw Errors.asRuntime(e);
				}
			}
		}).toString();
	}

}
