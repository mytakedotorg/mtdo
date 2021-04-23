/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2021 MyTake.org, Inc.
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
import com.google.common.collect.ImmutableSet;
import com.google.common.io.Resources;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.jetbrains.annotations.Nullable;
import org.jooby.Jooby;

/**
 * - Only works if run from within Eclipse IDE.
 * - Anytime a template is changed, the change will be visible on the next reload.
 * - Anytime another file in the server project is changed, the entire server
 *   will reboot within 1s, but the database will persist.  Should be seamless
 *   from the browser's point-of-view.
 */
public class DevHotReload {
	static boolean LOAD_BACKUP = false;

	public static void main(String[] args) throws Exception {
		File templateClassLocation;
		File[] codeLocations;
		if (Arrays.asList(args).contains("gradle")) {
			templateClassLocation = new File("build/classes/java/main");
			codeLocations = new File[]{
					templateClassLocation,
					new File("build/classes/java/test"),
					new File("../lucene/build/classes/java/main"),
					new File("../client-interface/build/classes/java/main"),
			};
		} else {
			templateClassLocation = new File("bin/main");
			codeLocations = new File[]{
					templateClassLocation,
					new File("bin/test"),
					new File("../lucene/bin/main"),
					new File("../client-interface/bin/main")
			};
		}
		// create a fresh database
		CleanPostgresModule postgresModule;
		if (LOAD_BACKUP) {
			postgresModule = CleanPostgresModule.loadFromBackup(ProdData.backupFile());
		} else {
			postgresModule = CleanPostgresModule.prePopulatedSchema();
		}
		boolean firstRun = true;
		while (true) {
			// create an app with an explicit "reload" route, which restarts everything except the DB
			Jooby app = new Jooby();
			app.get("/reload", req -> {
				app.stop();
				return "restarting";
			});
			// create a classloader for these directories
			IncludingClassLoader loader = new IncludingClassLoader(codeLocations);
			// Every second, check if any of the classes for this classloader have changed.
			// If they have, stop the app and restart
			new Thread() {
				@Override
				public void run() {
					while (!loader.anyFilesChanged()) {
						Errors.rethrow().run(() -> Thread.sleep(1000));
					}
					app.stop();
				}
			}.start();
			// initialize rocker reloading
			loader.loadClass("common.DevRockerReload").getMethod("initRockerReload", File.class).invoke(null, templateClassLocation);
			// use this classloader to load and start the app, using the persistent database
			Class<?> devClass = loader.loadClass("common.Dev");
			Jooby dev = (Jooby) devClass.getMethod("realtime", CleanPostgresModule.class).invoke(null, postgresModule);
			app.use(dev);
			if (!LOAD_BACKUP && firstRun) {
				// on the first run, setup the initial data
				app.use((Jooby.Module) loader.loadClass("common.InitialData$Module").getDeclaredConstructor().newInstance());
				firstRun = false;
			}
			app.start();
		}
	}

	///////////////////////////////////////////////////////////////////////////////////
	// Thanks to                                                                     //
	// https://www.toptal.com/java/java-wizardry-101-a-guide-to-java-class-reloading //
	// for the classloader tricks below                                              //
	///////////////////////////////////////////////////////////////////////////////////
	/**
	 * If the class starts with the given package, load
	 * as a resource on the classpath.
	 */
	static class IncludingClassLoader extends ExceptingClassLoader {
		private static final String[] PKGS = new String[]{
				"com.fizzed.rocker.",
				"org.jooby.rocker.",
				"org.jooby.quartz.",
				"org.jooby.internal.quartz.",
				"com.jsoniter.",
		};

		IncludingClassLoader(File[] codeLocations) {
			super(codeLocations);
			// needed for Quartz - any classes that define an @Scheduled need their packages defined here
			super.definePackage("controllers", null, null, null, null, null, null, null);
		}

		@Override
		@Nullable
		protected byte[] loadNewClass(String name) throws IOException {
			for (String pkg : PKGS) {
				if (name.startsWith(pkg)) {
					URL url = super.getResource(name.replace(".", "/") + ".class");
					return Resources.asByteSource(url).read();
				}
			}
			return super.loadNewClass(name);
		}
	}

	/**
	 * If the class starts with the given package, try to load from one of the given directories,
	 * else delegate up to the parent. 
	 */
	static class ExceptingClassLoader extends DynamicClassLoader {
		ExceptingClassLoader(File[] findCode) {
			super(findCode);
		}

		private static final String[] PKGS = new String[]{
				"compat.",
				"java2ts.",
				"jsoniter_codegen.",
				"org.mytake.lucene.",
				"auth.",
				"common.",
				"controllers.",
				"db.",
				"forms.",
				"json.",
				"views."
		};

		private static final ImmutableSet<String> EXCEPT = ImmutableSet.of(
				"common.CleanPostgresModule");

		@Override
		@Nullable
		protected byte[] loadNewClass(String name) throws IOException {
			for (String pkg : PKGS) {
				if (name.startsWith(pkg)) {
					return EXCEPT.contains(name) ? null : super.loadNewClass(name);
				}
			}
			return null;
		}
	}

	/** Loads from file. */
	static class DynamicClassLoader extends AggressiveClassLoader {
		private final File[] codeLocations;

		DynamicClassLoader(File[] codeLocations) {
			this.codeLocations = codeLocations;
		}

		final Map<File, Long> fileToLastModified = new HashMap<>();

		@Override
		protected byte[] loadNewClass(String name) throws IOException {
			for (File dir : codeLocations) {
				File file = new File(dir, name.replace('.', '/') + ".class");
				if (file.exists()) {
					Path p = file.toPath();
					long lastModified = Files.getLastModifiedTime(p).toMillis();
					synchronized (fileToLastModified) {
						fileToLastModified.put(file, lastModified);
					}
					return Files.readAllBytes(p);
				}
			}
			return null;
		}

		/** Returns true iff any of the files have changed. */
		public boolean anyFilesChanged() {
			synchronized (fileToLastModified) {
				for (Map.Entry<File, Long> entry : fileToLastModified.entrySet()) {
					if (entry.getKey().lastModified() != entry.getValue().longValue()) {
						return true;
					}
				}
			}
			return false;
		}
	}

	/** Loads from itself before delegating to parent. */
	static abstract class AggressiveClassLoader extends ClassLoader {
		private final Map<String, Class<?>> loadedClasses = new HashMap<>();
		private final ClassLoader parent = CleanPostgresModule.class.getClassLoader();

		@Override
		public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
			Class<?> result = loadedClasses.get(name);
			if (result == null) {
				byte[] newClassData = Errors.rethrow().get(() -> loadNewClass(name));
				if (newClassData != null) {
					Class<?> clazz = defineClass(name, newClassData, 0, newClassData.length);
					if (resolve) {
						resolveClass(clazz);
					}
					result = clazz;
				} else {
					result = parent.loadClass(name);
				}
				loadedClasses.put(name, result);
			}
			return result;
		}

		@Nullable
		protected abstract byte[] loadNewClass(String name) throws IOException;
	}
}
