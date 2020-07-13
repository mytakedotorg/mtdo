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

/** Builds a single field for a form. */
public class FormFieldBuilder extends RockerRaw {
	private final FormMarkup owner;
	private final String field;
	private final FormValidation<?> validation;

	FormFieldBuilder(FormMarkup owner, String field, FormValidation<?> validation) {
		this.owner = owner;
		this.field = field;
		this.validation = validation;
	}

	public FormFieldBuilder errorSpan(String... attributes) {
		String error = validation.errorForField(field);
		if (error != null) {
			appendRaw("<span");
			appendAttr(attributes);
			appendRaw(">");
			appendSafe(validation.errorForField(field));
			appendRaw("</span>\n");
		}
		return this;
	}

	public FormFieldBuilder label(String label, String... attributes) {
		appendRaw("<label");
		appendAttr("for", field);
		appendAttr(attributes);
		appendRaw(">");
		appendSafe(label);
		appendRaw("</label>\n");
		return this;
	}

	public FormFieldBuilder input(String type, String... attributes) {
		owner.usedField(field);
		appendRaw("<input");
		appendAttr("name", field, "type", type);
		appendAttr(attributes);
		String value = validation.initialValues.get(field);
		if (value != null) {
			appendAttr("value", value);
		}
		appendRaw(">");
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
