/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation.parsers;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.collect.ImmutableSet;
import java.util.ArrayList;
import java.util.List;
import java2ts.Foundation.DocumentComponent;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class FoundationParser {
	private static final ImmutableSet<String> ALLOWED_TAGS = ImmutableSet.of("p", "h2", "h3");

	public static List<DocumentComponent> toComponents(String input) {
		List<DocumentComponent> components = new ArrayList<>();
		Document doc = Jsoup.parse(input);
		int offset = 0;
		for (Element child : doc.body().children()) {
			if (child.childNodeSize() != 1) {
				throw new IllegalArgumentException("cannot have nested HTML tags: " + child.outerHtml());
			}
			DocumentComponent component = new DocumentComponent();
			component.component = child.tagName();
			Preconditions.checkArgument(ALLOWED_TAGS.contains(component.component));
			component.innerHTML = child.text();
			component.offset = offset;
			components.add(component);
			// java and javascript both use the UTF-16 length
			offset += component.innerHTML.length();
		}
		return components;
	}
}
