/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation.parsers;

import com.jsoniter.output.JsonStream;
import java.util.ArrayList;
import java.util.List;
import java2ts.Foundation.DocumentComponent;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.mytake.foundation.JsonInit;

public class FoundationParser {
	static {
		JsonInit.init();
	}

	public static String toJson(String input) {
		List<DocumentComponent> components = new ArrayList<>();
		Document doc = Jsoup.parse(input);
		for (Element child : doc.body().children()) {
			if (child.childNodeSize() != 1) {
				throw new IllegalArgumentException("cannot have nested HTML tags: " + child.outerHtml());
			}
			DocumentComponent component = new DocumentComponent();
			component.component = child.tagName();
			component.innerHTML = child.text();
			components.add(component);
		}
		return JsonStream.serialize(components);
	}
}
