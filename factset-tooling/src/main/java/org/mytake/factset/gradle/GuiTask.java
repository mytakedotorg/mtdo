/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2022 MyTake.org, Inc.
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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.gradle;


import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Resources;
import com.diffplug.common.swt.os.OS;
import com.diffplug.gradle.eclipse.MavenCentralExtension;
import com.diffplug.gradle.eclipse.MavenCentralPlugin;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.file.FileCollection;

class GuiTask {
	private static final String GUI_CONFIG = "gui";

	static void setup(Project p, MtdoFactset factset) throws IOException {
		p.getRepositories().mavenCentral();
		Configuration guiConfig = p.getConfigurations().create(GUI_CONFIG, cfg -> {
			cfg.setTransitive(true);
			cfg.setCanBeResolved(true);
			cfg.setCanBeConsumed(false);
		});

		p.getPlugins().apply(MavenCentralPlugin.class);
		MavenCentralExtension ext = p.getExtensions().getByType(MavenCentralExtension.class);
		ext.release("4.17.0", release -> {
			release.dep(GUI_CONFIG, "org.eclipse.swt");
			release.dep(GUI_CONFIG, "org.eclipse.jface");
			release.dep(GUI_CONFIG, "org.eclipse.jface.text");
			if (OS.getNative().isWindows()) {
				release.dep(GUI_CONFIG, "org.eclipse.swt.browser.chromium.win32.win32.x86_64");
			}
			release.useNativesForRunningPlatform();
		});
		p.getDependencies().add(GUI_CONFIG, "com.diffplug.durian:durian-swt:3.6.1");
		p.getDependencies().add(GUI_CONFIG, "com.ibm.icu:icu4j:69.1");
		p.getDependencies().add(GUI_CONFIG, p.getDependencies().gradleApi());

		p.getTasks().register("gui", org.gradle.api.tasks.JavaExec.class, task -> {
			task.setGroup("GUI");
			task.setDescription("Launches a gui for the factset");

			task.setMain("org.mytake.factset.swt.Workbench");
			if (OS.getNative().isMac()) {
				File icon;
				try (InputStream input = Resources.asByteSource(MtdoFactset.class.getResource("/icon/logo_leaves_256.png")).openBufferedStream()) {
					icon = new File(".gradle/icon.png").getCanonicalFile();
					Files.copy(input, icon.toPath(), StandardCopyOption.REPLACE_EXISTING);
				} catch (IOException e) {
					throw Errors.asRuntime(e);
				}
				task.jvmArgs("-XstartOnFirstThread", "-Xdock:icon=" + icon.getAbsolutePath());
			}
			task.args(factset.title);
			FileCollection buildscript = p.getBuildscript().getConfigurations().getByName("classpath");
			task.setClasspath(buildscript.plus(guiConfig));
		});
	}

	//	static Set<File> fromLocalClassloader() {
	//		Set<File> files = new LinkedHashSet<>();
	//		Consumer<Class<?>> addPeerClasses = clazz -> {
	//			URLClassLoader urlClassloader = (URLClassLoader) clazz.getClassLoader();
	//			for (URL url : urlClassloader.getURLs()) {
	//				String name = url.getFile();
	//				if (name != null) {
	//					files.add(new File(name));
	//				}
	//			}
	//		};
	//		// add the gradle API
	//		addPeerClasses.accept(JavaExec.class);
	//		return files;
	//	}
}
