/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
import com.google.common.base.Preconditions;
import controllers.FoundationAssets;
import java.net.ServerSocket;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.swing.JOptionPane;
import org.jooby.Jooby;

/** Opens a browser to show content. */
class OpenBrowser {
	/** Returns true if we are in an interactive environment */
	public static boolean isInteractive() {
		String ci = System.getenv("CI");
		return ci == null;
	}

	Map<String, String> map = new LinkedHashMap<>();

	public OpenBrowser add(String url, String content) {
		Preconditions.checkArgument(url.startsWith("/"));
		map.put(url, content);
		return this;
	}

	public void waitForOk(String message) {
		blockAndGet(message, JOptionPane.DEFAULT_OPTION);
	}

	public boolean isYes(String message) {
		return blockAndGet(message, JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
	}

	private int blockAndGet(String message, int kind) {
		try {
			ServerSocket socket = new ServerSocket(0);
			int port = socket.getLocalPort();
			socket.close();

			Jooby jooby = new Jooby();
			CustomAssets.initTemplates(jooby);
			jooby.use(new FoundationAssets());

			jooby.port(port);
			map.forEach((url, content) -> {
				jooby.get(url, () -> content);
			});
			jooby.start("server.join=false");

			for (String url : map.keySet()) {
				java.awt.Desktop.getDesktop().browse(new URI("http://localhost:" + port + url));
			}

			JOptionPane.getRootFrame().setAlwaysOnTop(true);
			int dialogResult = JOptionPane.showConfirmDialog(null, message, message, kind);
			jooby.stop();
			return dialogResult;
		} catch (Exception e) {
			throw Errors.asRuntime(e);
		}
	}
}
