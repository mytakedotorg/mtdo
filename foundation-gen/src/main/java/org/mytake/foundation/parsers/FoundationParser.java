package org.mytake.foundation.parsers;

import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.mytake.foundation.JsonInit;

import com.jsoniter.output.JsonStream;

import java2ts.Foundation.DocumentComponent;

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
