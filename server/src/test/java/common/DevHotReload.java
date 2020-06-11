/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nullable;
import org.jooby.Jooby;

/**
 * - Only works if run from within Eclipse IDE.
 * - Anytime a template is changed, the change will be visible on the next reload.
 * - Anytime another file in the server project is changed, the entire server
 *   will reboot within 1s, but the database will persist.  Should be seamless
 *   from the browser's point-of-view.
 */
public class DevHotReload {
	static boolean LOAD_BACKUP = true;
	// if you reload emails, then you can't reload webpages.  And vice-versa.
	static boolean RELOAD_EMAILS = false;

	public static void main(String[] args) throws Exception {
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
			IncludingClassLoader loader = new IncludingClassLoader();
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
			loader.loadClass("common.DevRockerReload").getMethod("initRockerReload").invoke(null);
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

		IncludingClassLoader() {
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
		private static File[] DIRS = new File[]{
				new File("bin/main"),
				new File("bin/test"),
				new File("../lucene/bin/main"),
				new File("../client/bin/main")
		};
		final Map<File, Long> fileToLastModified = new HashMap<>();

		@Override
		protected byte[] loadNewClass(String name) throws IOException {
			for (File dir : DIRS) {
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
		public Class<?> loadClass(String nameRaw, boolean resolve) throws ClassNotFoundException {
			return loadedClasses.computeIfAbsent(nameRaw, Errors.rethrow().wrapFunction(name -> {
				byte[] newClassData = loadNewClass(name);
				if (newClassData != null) {
					Class<?> clazz = defineClass(name, newClassData, 0, newClassData.length);
					if (resolve) {
						resolveClass(clazz);
					}
					return clazz;
				} else {
					return parent.loadClass(name);
				}
			}));
		}

		@Nullable
		protected abstract byte[] loadNewClass(String name) throws IOException;
	}
}
