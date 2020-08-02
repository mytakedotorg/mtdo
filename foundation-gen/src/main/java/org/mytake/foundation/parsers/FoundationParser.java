/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation.parsers;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.collect.ImmutableSet;
import java.util.ArrayList;
import java.util.List;
import java2ts.FT.DocumentComponent;
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
