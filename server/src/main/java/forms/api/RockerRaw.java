/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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
