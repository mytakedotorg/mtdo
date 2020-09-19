/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
package org.mytake.fact.parsers;


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
