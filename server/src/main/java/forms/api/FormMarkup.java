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

import com.google.common.base.Preconditions;
import com.google.common.collect.Sets;
import com.google.common.collect.Sets.SetView;
import forms.meta.MetaField;
import java.util.HashSet;
import java.util.Set;

/** Creates a form, with validation fields and CSRF protection, inside a Rocker template. */
public class FormMarkup {
	private final String postUrl;
	private final FormDef def;
	private final FormValidation<?> validation;

	public FormMarkup(String postUrl, FormDef def, FormValidation<?> validation) {
		this.postUrl = postUrl;
		this.def = def;
		this.validation = validation;
	}

	/** Used to validate that every field is created. */
	private final Set<String> usedFields = new HashSet<>();

	public RockerRaw openForm(String... attributes) {
		return new RockerRaw()
				.appendRaw("<form")
				.appendAttr(
						"enctype", "application/x-www-form-urlencoded",
						"action", postUrl,
						"method", "post")
				.appendAttr(attributes)
				.appendRaw(">");
	}

	public FormFieldBuilder field(MetaField<?> field) {
		return field(field.name());
	}

	public FormFieldBuilder field(String name) {
		return new FormFieldBuilder(this, name, validation);
	}

	void usedField(String name) {
		boolean firstTime = usedFields.add(name);
		if (!firstTime) {
			throw new IllegalArgumentException("You called `field(\"" + name + "\").input(...)` more than once.");
		}
	}

	public RockerRaw closeForm() {
		// check that all fields have been used
		SetView<String> unused = Sets.difference(def.fieldNames(), usedFields);
		SetView<String> unknown = Sets.difference(usedFields, def.fieldNames());
		Preconditions.checkState(unused.isEmpty() && unknown.isEmpty(), "unused=%s unknown=%s", unused, unknown);

		return new RockerRaw()
				// CSRF
				.appendRaw("<input")
				.appendAttr("type", "hidden", "name", CSRF_FIELD, "value", "TODO")
				.appendRaw(">")
				.appendRaw("</input>\n")
				// then close the form
				.appendRaw("</form>\n");
	}

	public static final String CSRF_FIELD = "csrf";

	public RockerRaw formSuccess() {
		RockerRaw raw = new RockerRaw();
		if (validation.successForForm() != null) {
			raw.appendRaw("<div class=\"alert alert-success\">")
					.appendSafe(validation.successForForm())
					.appendRaw("</div>\n");
		}
		return raw;
	}

	public RockerRaw formError() {
		RockerRaw raw = new RockerRaw();
		if (validation.errorForForm() != null) {
			raw.appendRaw("<div class=\"alert alert-error\">")
					.appendSafe(validation.errorForForm())
					.appendRaw("</div>\n");
		}
		return raw;
	}
}
