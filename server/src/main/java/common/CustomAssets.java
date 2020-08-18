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

import com.google.common.io.Resources;
import com.google.inject.Binder;
import com.jsoniter.JsonIterator;
import com.jsoniter.any.Any;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.assets.AssetCompiler;
import org.jooby.rocker.Rockerby;

public class CustomAssets implements Jooby.Module {
	public static void initTemplates(Jooby jooby) {
		// sets variables that the templates need
		jooby.use(new CustomAssets());
		// makes rocker templates work
		jooby.use(new Rockerby());
	}

	private CustomAssets() {}

	static final String _STYLES = "_styles";
	static final String _SCRIPTS = "_scripts";
	static final String FB_APP_ID = "fbappid";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().assets("/favicon.ico", "/assets/permanent/favicon-6022c3e42d.ico");

		Config config;
		BiFunction<String, String, String> url;
		String fbAppId = conf.getString("application.fbAppId");
		if (env.name().equals("dev")) {
			config = ConfigFactory.parseResources("assets.dev.conf");
			url = (type, raw) -> "/assets-dev/" + type + raw;
			env.router().assets("/assets-dev/**");
			env.router().assets("/assets/**");
		} else {
			config = ConfigFactory.parseResources("assets.conf");
			byte[] manifest = Resources.toByteArray(CustomAssets.class.getResource("/assets/manifest.json"));
			Map<String, Any> map = JsonIterator.deserialize(manifest).asMap();
			url = (type, raw) -> "/assets/" + type + "/" + Objects.requireNonNull(map.get(raw.substring(1)), "No fingerprinted version of " + raw + ", only has: " + map.keySet());
			env.router().assets("/assets/**");
		}
		AssetCompiler compiler = new AssetCompiler(config);
		// key, style, key, script
		List<String> keyValue = keyValueFor(compiler, url);
		env.router().before((req, rsp) -> {
			for (int i = 0; i < keyValue.size() / 2; ++i) {
				String key = keyValue.get(2 * i);
				String value = keyValue.get(2 * i + 1);
				req.set(key, value);
			}
			req.set(FB_APP_ID, fbAppId);
		});
	}

	static List<String> keyValueFor(AssetCompiler compiler, BiFunction<String, String, String> url) {
		List<String> keyValue = new ArrayList<>(4 * compiler.fileset().size());
		for (String fileset : compiler.fileset()) {
			keyValue.add(fileset + CustomAssets._STYLES);
			keyValue.add(styles(url, compiler, fileset));
			keyValue.add(fileset + CustomAssets._SCRIPTS);
			keyValue.add(scripts(url, compiler, fileset));
		}
		return keyValue;
	}

	private static final String SLASH_SHA_384 = "/sha384-";

	private static String styles(BiFunction<String, String, String> urlMapper, AssetCompiler compiler, String fileset) {
		return compiler.styles(fileset).stream()
				.map(url -> url.startsWith(SLASH_SHA_384) ? url : urlMapper.apply("styles", url))
				.map(CustomAssets::subresourceIntegrityStyle)
				.collect(Collectors.joining("\n"));
	}

	private static String scripts(BiFunction<String, String, String> urlMapper, AssetCompiler compiler, String fileset) {
		return compiler.scripts(fileset).stream()
				.map(url -> url.startsWith(SLASH_SHA_384) ? url : urlMapper.apply("scripts", url))
				.map(CustomAssets::subresourceIntegrityScript)
				.collect(Collectors.joining("\n"));
	}

	private static String subresourceIntegrityStyle(String input) {
		if (input.startsWith(SLASH_SHA_384)) {
			int barIdx = input.indexOf('|');
			String integrity = input.substring(1, barIdx); // 1=remove slash
			String url = input.substring(barIdx + 1);
			return "<link rel=\"stylesheet\" href=\"" + url + "\" integrity=\"" + integrity + "\" crossorigin=\"anonymous\">";
		} else {
			return "<link rel=\"stylesheet\" href=\"" + input + "\">";
		}
	}

	private static String subresourceIntegrityScript(String input) {
		if (input.startsWith(SLASH_SHA_384)) {
			int barIdx = input.indexOf('|');
			String integrity = input.substring(1, barIdx); // 1=remove slash
			String url = input.substring(barIdx + 1);
			return "<script type=\"text/javascript\" src=\"" + url + "\" integrity=\"" + integrity + "\" crossorigin=\"anonymous\"></script>";
		} else {
			return "<script type=\"text/javascript\" src=\"" + input + "\"></script>";
		}
	}
}
