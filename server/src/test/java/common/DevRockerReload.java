/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
	public static void initRockerReload(File templateClassLocation) throws Exception {
		ReloadingRockerBootstrap bootstrap = new ReloadingRockerBootstrap();
		// specific to hotreload
		bootstrap.getConfiguration().setClassDirectory(templateClassLocation);
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
