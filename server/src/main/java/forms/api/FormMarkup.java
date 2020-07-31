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

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;
import com.google.common.collect.Sets.SetView;
import forms.meta.MetaField;
import java.util.HashSet;
import java.util.Set;

/** Creates a form, with validation fields and CSRF protection, inside a Rocker template. */
public class FormMarkup<F extends FormDef> {
	private final FormDef def;
	private final FormValidation<F> validation;

	public FormMarkup(FormDef def, FormValidation<F> validation) {
		this.def = def;
		this.validation = validation;
	}

	public FormMarkup<F> standardPolicies() {
		return labelPolicy("class", "form__label")
				.inputPolicy("class", "form__input form__input--inline");
	}

	public FormValidation<F> validation() {
		return validation;
	}

	ImmutableMap<String, String> labelPolicy = ImmutableMap.of();
	ImmutableMap<String, String> inputPolicy = ImmutableMap.of();

	public FormMarkup<F> labelPolicy(String... attributes) {
		this.labelPolicy = toMap(attributes);
		return this;
	}

	public FormMarkup<F> inputPolicy(String... attributes) {
		this.inputPolicy = toMap(attributes);
		return this;
	}

	private static ImmutableMap<String, String> toMap(String... keyValues) {
		ImmutableMap.Builder<String, String> builder = ImmutableMap.builder();
		for (int i = 0; i < keyValues.length / 2; ++i) {
			builder.put(keyValues[2 * i], keyValues[2 * i + 1]);
		}
		return builder.build();
	}

	/** Used to validate that every field is created. */
	private final Set<String> usedFields = new HashSet<>();

	public RockerRaw openForm(String... attributes) {
		RockerRaw openForm = new RockerRaw();
		openForm.appendRaw("<form").appendAttr("action", def.actionUrl());
		def.method().addAttr(openForm);
		openForm.appendAttr(attributes);
		openForm.appendRaw(">");
		return openForm;
	}

	public FormFieldBuilder field(MetaField<?> field) {
		return field(field.name());
	}

	public FormFieldBuilder field(String name) {
		return new FormFieldBuilder(this, name);
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

		// then close the form
		return new RockerRaw().appendRaw("</form>\n");
	}

	public RockerRaw formError() {
		RockerRaw raw = new RockerRaw();
		if (validation.formError() != null) {
			raw.appendRaw("<div class=\"alert alert-danger\">")
					.appendSafe(validation.formError())
					.appendRaw("</div>\n");
		}
		return raw;
	}
}
