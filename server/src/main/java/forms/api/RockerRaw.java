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
package forms.api;

import com.fizzed.rocker.ContentType;
import com.fizzed.rocker.RenderingException;
import com.fizzed.rocker.runtime.DefaultRockerModel;
import com.fizzed.rocker.runtime.DefaultRockerTemplate;
import com.google.common.base.Preconditions;
import com.google.common.html.HtmlEscapers;
import com.google.common.xml.XmlEscapers;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Simple way to insert raw content into a rocker template. */
public class RockerRaw extends DefaultRockerModel {
	private final List<String> toWrite = new ArrayList<>();

	/** Appends the given raw content. */
	public RockerRaw appendRaw(String str) {
		toWrite.add(str);
		return this;
	}

	/** Appends HTML attributes.  Pass null as the value for a boolean attribute. */
	public RockerRaw appendAttr(String... attributes) {
		Preconditions.checkArgument(attributes.length % 2 == 0);
		for (int i = 0; i < attributes.length / 2; ++i) {
			String key = attributes[2 * i];
			String value = attributes[2 * i + 1];
			appendRaw(" ");
			appendRaw(key);
			if (value != null) {
				appendRaw("=\"");
				appendRaw(XmlEscapers.xmlAttributeEscaper().escape(value));
				appendRaw("\"");
			}
		}
		return this;
	}

	/** Safely escapes HTML content. */
	public RockerRaw appendSafe(String raw) {
		appendRaw(HtmlEscapers.htmlEscaper().escape(raw));
		return this;
	}

	@Override
	protected DefaultRockerTemplate buildTemplate() throws RenderingException {
		return new DefaultRockerTemplate(this) {
			{
				__internal.setCharset(StandardCharsets.UTF_8.name());
				__internal.setContentType(ContentType.HTML);
			}

			@Override
			protected void __doRender() throws IOException, RenderingException {
				for (String str : toWrite) {
					__internal.writeValue(str);
				}
			}
		};
	}
}
