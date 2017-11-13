/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.common.io.Resources;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.assets.AssetCompiler;

public class CustomAssets implements Jooby.Module {
	static final String _STYLES = "_styles";
	static final String _SCRIPTS = "_scripts";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Config config = ConfigFactory.parseResources("assets.conf");
		AssetCompiler compiler = new AssetCompiler(config);
		Function<String, String> url;
		if (env.name().equals("dev")) {
			url = raw -> "/assets/dev/" + raw;
			env.router().assets("/assets/dev/**");
		} else {
			String manifest = Resources.toString(CustomAssets.class.getResource(
					"/assets/prod/manifest.json"), StandardCharsets.UTF_8);
			Map<String, String> map = new Gson().fromJson(manifest, new TypeToken<HashMap<String, String>>() {}.getType());
			url = raw -> "/assets/prod/" + Objects.requireNonNull(map.get(raw), "No fingerprinted version of " + raw);
			env.router().assets("/assets/prod/**");
		}
		// key, style, key, script
		List<String> keyValue = new ArrayList<>(4 * compiler.fileset().size());
		for (String fileset : compiler.fileset()) {
			keyValue.add(fileset + CustomAssets._STYLES);
			keyValue.add(styles(url, compiler, fileset));
			keyValue.add(fileset + CustomAssets._SCRIPTS);
			keyValue.add(scripts(url, compiler, fileset));
		}
		env.router().before((req, rsp) -> {
			for (int i = 0; i < keyValue.size() / 2; ++i) {
				String key = keyValue.get(2 * i);
				String value = keyValue.get(2 * i + 1);
				req.set(key, value);
			}
		});
	}

	private static String styles(Function<String, String> urlMapper, AssetCompiler compiler, String fileset) {
		return compiler.scripts(fileset).stream()
				.map(urlMapper)
				.map(script -> "<script type=\"text/javascript\" src=\"/" + script + "\"></script>")
				.collect(Collectors.joining());
	}

	private static String scripts(Function<String, String> urlMapper, AssetCompiler compiler, String fileset) {
		return compiler.scripts(fileset).stream()
				.map(urlMapper)
				.map(script -> "<link rel=\"stylesheet\" href=\"/" + script + "\">")
				.collect(Collectors.joining());
	}
}
