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
 * You can contact us at team@mytake.org
 */
package forms.api;

import com.google.common.base.Preconditions;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.annotation.Nullable;

/**
 * Maintains per-field errors, along with an error for the entire
 * form and a success message for the entire form.
 */
public class FormValidation<T> {
	protected final LegacyFormDef def;

	protected FormValidation(LegacyFormDef def) {
		this.def = def;
	}

	public LegacyFormDef def() {
		return def;
	}

	final Map<String, String> initialValues = new HashMap<>();
	protected final Map<String, String> errorForField = new HashMap<>();
	private String formSuccess;
	private String formError;
	private T parsedValue;

	@Nullable
	public String init(String field) {
		return initialValues.get(field);
	}

	public boolean noErrors() {
		return errorForField.isEmpty() && formError == null;
	}

	@Nullable
	public String errorForField(String field) {
		return errorForField.get(field);
	}

	@Nullable
	public String errorForForm() {
		return formError;
	}

	@Nullable
	public String successForForm() {
		return formSuccess;
	}

	@Nullable
	public T parsedValue() {
		return parsedValue;
	}

	/////////////
	// SETTERS //
	/////////////
	public FormValidation<T> init(String field, String value) {
		Objects.requireNonNull(field, "field");
		Objects.requireNonNull(value, "value");
		initialValues.put(field, value);
		return this;
	}

	public FormValidation<T> errorForField(String field, String error) {
		Preconditions.checkArgument(def.fieldNames().contains(field), field + " is not a valid field name. allowed=" + def.fieldNames());
		Objects.requireNonNull(field, "field");
		Objects.requireNonNull(error, "error");
		errorForField.compute(field, (key, oldError) -> {
			if (oldError == null) {
				return error;
			} else {
				return oldError + "\n" + error;
			}
		});
		return this;
	}

	public FormValidation<T> errorForForm(String formError) {
		this.formError = Objects.requireNonNull(formError, "formError");
		return this;
	}

	public FormValidation<T> summarizeErrorsIfNecessary() {
		if (!errorForField.isEmpty() && formError == null) {
			formError = pluralize(errorForField.keySet(), "Error", "Errors") + " in " + fieldsWithErrors() + ".";
		}
		return this;
	}

	public String fieldsWithErrors() {
		Preconditions.checkState(!errorForField.isEmpty());
		return def.fieldNames().stream()
				.filter(errorForField.keySet()::contains)
				.collect(Collectors.joining(", "));
	}

	private static String pluralize(Collection<?> c, String singular, String plural) {
		return c.size() == 1 ? singular : plural;
	}

	public FormValidation<T> successForForm(String formSuccess) {
		this.formSuccess = Objects.requireNonNull(formSuccess, "formSuccess");
		return this;
	}

	public FormValidation<T> parsedValue(T value) {
		this.parsedValue = Objects.requireNonNull(value, "parsedValue");
		return this;
	}

	///////////////////
	// Create markup //
	///////////////////
	public FormMarkup markup(String postUrl) {
		return new FormMarkup(postUrl, def, this);
	}
}
