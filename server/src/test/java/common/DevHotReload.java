/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.collect.ImmutableSet;
import com.fizzed.rocker.model.JavaVersion;
import com.fizzed.rocker.reload.ReloadingRockerBootstrap;
import com.fizzed.rocker.runtime.RockerRuntime;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
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
	public static void main(String[] args) throws Exception {
		initRockerReload();
		// create a fresh database
		CleanPostgresModule postgresModule = new CleanPostgresModule();
		boolean firstRun = true;
		while (true) {
			// create an app with an explicit "reload" route, which restarts everything except the DB
			Jooby app = new Jooby();
			app.get("/reload", req -> {
				app.stop();
				return "restarting";
			});
			// create a classloader for these directories
			ExceptingClassLoader loader = new ExceptingClassLoader(
					new File("bin/main"),
					new File("bin/test"));
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
			// use this classloader to load and start the app, using the persistent database
			Class<?> devClass = loader.loadClass("common.Dev");
			Jooby dev = (Jooby) devClass.getConstructor(CleanPostgresModule.class).newInstance(postgresModule);
			app.use(dev);
			if (firstRun) {
				// on the first run, setup the initial data
				app.use(new InitialData.Module());
				firstRun = false;
			}
			app.start();
		}
	}

	private static void initRockerReload() throws Exception {
		ReloadingRockerBootstrap bootstrap = new ReloadingRockerBootstrap();
		// specific to hotreload
		bootstrap.getConfiguration().setClassDirectory(new File("bin/main"));
		// the rest shuold match server/build.gradle
		bootstrap.getConfiguration().setTemplateDirectory(new File("src/main/rocker").getAbsoluteFile());
		bootstrap.getConfiguration().setOutputDirectory(new File("src/main/rocker-generated").getAbsoluteFile());
		bootstrap.getConfiguration().getOptions().setJavaVersion(JavaVersion.v1_8);
		bootstrap.getConfiguration().getOptions().setExtendsModelClass("common.CustomRockerModel");
		bootstrap.getConfiguration().getOptions().setExtendsClass("common.CustomRockerTemplate");
		// use reflection to setup RockerRuntime
		Field bootstrapField = RockerRuntime.class.getDeclaredField("bootstrap");
		bootstrapField.setAccessible(true);
		bootstrapField.set(RockerRuntime.getInstance(), bootstrap);

		Field reloadingField = RockerRuntime.class.getDeclaredField("reloading");
		reloadingField.setAccessible(true);
		reloadingField.set(RockerRuntime.getInstance(), true);
	}

	///////////////////////////////////////////////////////////////////////////////////
	// Thanks to                                                                     //
	// https://www.toptal.com/java/java-wizardry-101-a-guide-to-java-class-reloading //
	// for the classloader tricks below                                              //
	///////////////////////////////////////////////////////////////////////////////////
	/**
	 * If the class starts with the given package, try to load from one of the given directories,
	 * else delegate up to the parent. 
	 */
	static class ExceptingClassLoader extends DynamicClassLoader {
		private static final String[] PKGS = new String[]{
				"auth.",
				"common.",
				"controllers.",
				"forms.",
				"json.",
		};

		private static final ImmutableSet<String> EXCEPT = ImmutableSet.of(
				"common.CleanPostgresModule");

		public ExceptingClassLoader(File... dirs) {
			super(dirs);
		}

		@Override
		@Nullable
		protected byte[] loadNewClass(String name) {
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
		File[] dirs;
		Map<File, Long> fileToLastModified = new HashMap<>();

		public DynamicClassLoader(File... dirs) {
			this.dirs = dirs;
		}

		@Override
		protected byte[] loadNewClass(String name) {
			for (File dir : dirs) {
				File file = new File(dir, name.replace('.', '/') + ".class");
				if (file.exists()) {
					try {
						Path p = file.toPath();
						long lastModified = Files.getLastModifiedTime(p).toMillis();
						fileToLastModified.put(file, lastModified);
						return Files.readAllBytes(p);
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
				}
			}
			return null;
		}

		/** Returns true iff any of the files have changed. */
		public boolean anyFilesChanged() {
			for (Map.Entry<File, Long> entry : fileToLastModified.entrySet()) {
				if (entry.getKey().lastModified() != entry.getValue().longValue()) {
					return true;
				}
			}
			return false;
		}
	}

	/** Loads from itself before delegating to parent. */
	static abstract class AggressiveClassLoader extends ClassLoader {
		Set<String> loadedClasses = new HashSet<>();
		Set<String> unavaiClasses = new HashSet<>();
		private ClassLoader parent = DevHotReload.class.getClassLoader();

		@Override
		public Class<?> loadClass(String name) throws ClassNotFoundException {
			if (loadedClasses.contains(name) || unavaiClasses.contains(name)) {
				return super.loadClass(name); // Use default CL cache
			}

			byte[] newClassData = loadNewClass(name);
			if (newClassData != null) {
				loadedClasses.add(name);
				return loadClass(newClassData, name);
			} else {
				unavaiClasses.add(name);
				return parent.loadClass(name);
			}
		}

		@Nullable
		protected abstract byte[] loadNewClass(String name);

		private Class<?> loadClass(byte[] classData, String name) {
			Class<?> clazz = defineClass(name, classData, 0, classData.length);
			if (clazz != null) {
				if (clazz.getPackage() == null) {
					definePackage(name.replaceAll("\\.\\w+$", ""), null, null, null, null, null, null, null);
				}
				resolveClass(clazz);
			}
			return clazz;
		}
	}
}
