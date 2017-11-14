/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.google.common.base.Preconditions;
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

	public boolean isYes(String message) {
		try {
			ServerSocket socket = new ServerSocket(0);
			int port = socket.getLocalPort();
			socket.close();

			Jooby jooby = new Jooby();
			jooby.use(new CustomAssets());
			jooby.port(port);
			map.forEach((url, content) -> {
				jooby.get(url, () -> content);
			});
			jooby.start("server.join=false");

			for (String url : map.keySet()) {
				java.awt.Desktop.getDesktop().browse(new URI("http://localhost:" + port + url));
			}

			JOptionPane.getRootFrame().setAlwaysOnTop(true);
			int dialogResult = JOptionPane.showConfirmDialog(null, message);
			jooby.stop();
			return dialogResult == JOptionPane.YES_OPTION;
		} catch (Exception e) {
			throw Errors.asRuntime(e);
		}
	}
}
