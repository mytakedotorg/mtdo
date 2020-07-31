/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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

import com.google.common.collect.ImmutableMap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/** Builds a single field for a form. */
public class FormFieldBuilder extends RockerRaw {
	private final FormMarkup<?> owner;
	private final String field;

	FormFieldBuilder(FormMarkup<?> owner, String field) {
		this.owner = owner;
		this.field = field;
	}

	public FormFieldBuilder errorSpan(String... attributes) {
		String error = owner.validation().errors().get(field);
		if (error != null) {
			appendRaw("<span ");
			if (attributes.length == 0) {
				appendRaw("class=\"error\"");
			} else {
				appendAttr(attributes);
			}
			appendRaw(">");
			appendSafe(owner.validation().errors().get(field));
			appendRaw("</span>\n");
		}
		return this;
	}

	public FormFieldBuilder label(String label, String... attributes) {
		appendRaw("<label");
		appendAttr("for", field);
		appendAttr(owner.labelPolicy, attributes);
		appendRaw(">");
		appendSafe(label);
		appendRaw("</label>\n");
		return this;
	}

	public static final String TEXTAREA = "textarea";

	private static final int TEXTAREA_MIN_ROW = 3;
	private static final int TEXTAREA_MIN_COL = 60;

	private void appendTextAreaRowsCols(int rows, int cols) {
		rows = Math.max(rows, TEXTAREA_MIN_ROW);
		cols = Math.max(cols, TEXTAREA_MIN_COL);
		appendAttr("rows", Integer.toString(rows), "cols", Integer.toString(cols));
		appendRaw(">");
	}

	public FormFieldBuilder input(String type, String... attributes) {
		owner.usedField(field);
		String value = owner.validation().values().get(field);
		if (type.equals(TEXTAREA)) {
			appendRaw("<textarea");
			appendAttr("name", field);
			if (value != null) {
				String lines[] = value.split("\\r?\\n");
				int rows = lines.length;
				int cols = Arrays.stream(lines)
						.mapToInt(String::length)
						.max().orElse(0);
				appendTextAreaRowsCols(rows + 2, cols);
				appendSafe(value);
			} else {
				appendTextAreaRowsCols(0, 0);
			}
			appendRaw("</textarea>\n");
		} else {
			appendRaw("<input");
			appendAttr("name", field, "type", type);
			appendAttr(owner.inputPolicy, attributes);
			if (value != null) {
				if (type.equals("checkbox")) {
					if (value.equals("on")) {
						appendAttr("checked", null);
					}
				} else {
					appendAttr("value", value);
				}
			}
			appendRaw(">");
		}
		return this;
	}

	private void appendAttr(ImmutableMap<String, String> policy, String[] attributes) {
		List<String> policyOverloads = new ArrayList<>();
		for (int i = 0; i < attributes.length / 2; ++i) {
			String key = attributes[2 * i];
			String value = attributes[2 * i + 1];
			if (policy.containsKey(key)) {
				policyOverloads.add(key);
			}
			appendAttr(key, value);
		}
		for (Map.Entry<String, String> entry : policy.entrySet()) {
			if (!policyOverloads.contains(entry.getKey())) {
				appendAttr(entry.getKey(), entry.getValue());
			}
		}
	}

	public FormFieldBuilder openSelect(String... attributes) {
		owner.usedField(field);
		appendRaw("<select");
		appendAttr("name", field);
		appendAttr(attributes);
		appendRaw(">");
		return this;
	}

	public FormFieldBuilder options(Map<String, String> valuesToContent, String... attributes) {
		for (Map.Entry<String, String> item : valuesToContent.entrySet()) {
			String value = item.getKey();
			String content = item.getValue();
			appendRaw("<option value=\"");
			appendRaw(value);
			appendRaw("\">");
			appendRaw(content);
			appendRaw("</option>");
		}
		return this;
	}

	public FormFieldBuilder closeSelect() {
		appendRaw("</select>");
		return this;
	}

	@Override
	public FormFieldBuilder appendRaw(String str) {
		super.appendRaw(str);
		return this;
	}

	/** Appends HTML attributes.  Pass null as the value for a boolean attribute. */
	@Override
	public FormFieldBuilder appendAttr(String... attributes) {
		super.appendAttr(attributes);
		return this;
	}

	/** Safely escapes HTML content. */
	@Override
	public FormFieldBuilder appendSafe(String raw) {
		super.appendSafe(raw);
		return this;
	}
}
