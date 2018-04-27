/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.fizzed.rocker.model.JavaVersion;
import com.fizzed.rocker.reload.ReloadingRockerBootstrap;
import com.fizzed.rocker.reload.RockerClassLoader;
import com.fizzed.rocker.runtime.RockerRuntime;
import com.google.common.io.Resources;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URL;

public class DevRockerReload {
	public static void initRockerReload() throws Exception {
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

		RockerClassLoader classloader = new HotRockerClassLoader(bootstrap);
		Field classloaderField = ReloadingRockerBootstrap.class.getDeclaredField("classLoader");
		classloaderField.setAccessible(true);
		classloaderField.set(bootstrap, classloader);

		Field reloadingField = RockerRuntime.class.getDeclaredField("reloading");
		reloadingField.setAccessible(true);
		reloadingField.set(RockerRuntime.getInstance(), true);
	}

	public static class HotRockerClassLoader extends RockerClassLoader {
		final ReloadingRockerBootstrap bootstrap;

		public HotRockerClassLoader(ReloadingRockerBootstrap bootstrap) {
			super(bootstrap, HotRockerClassLoader.class.getClassLoader());
			this.bootstrap = bootstrap;
		}

		@Override
		public Class<?> loadClass(String className) throws ClassNotFoundException {
			// only load classes registered with rocker dynamic bootstrap
			if (!bootstrap.isReloadableClass(className)) {
				return super.loadClass(className);
			} else {
				String resourceName = className.replace(".", "/") + ".class";
				URL url = this.getResource(resourceName);
				if (url == null) {
					throw new ClassNotFoundException("Class " + className + " not found");
				}
				try {
					byte[] classData = Resources.toByteArray(url);
					Class<?> clazz = defineClass(className, classData, 0, classData.length);
					resolveClass(clazz);
					return clazz;
				} catch (IOException e) {
					throw new ClassNotFoundException("Class " + className + " not found", e);
				}
			}
		}
	}
}
