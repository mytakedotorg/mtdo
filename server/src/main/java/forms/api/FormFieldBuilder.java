/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
