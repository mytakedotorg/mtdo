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
package forms.meta;

import forms.api.FormValidation;
import java.util.List;
import java.util.regex.Pattern;
import org.apache.commons.validator.routines.EmailValidator;

public interface Validator<T> {
	void validate(FormValidation.AbstractBuilder<?, ?> validation, String fieldName, T value);

	default void validate(FormValidation.AbstractBuilder<?, ?> validation, MetaField<? extends T> field) {
		if (validation.def().fieldNames().contains(field.name())) {
			validate(validation, field.name(), validation.value(field));
		} else if (validation.error(field) == null) {
			validation.addError(field, "Missing");
		}
	}

	public static Validator<String> name() {
		return (validation, fieldName, value) -> {
			if (value.isEmpty()) {
				validation.addError(fieldName, "Name can't be empty");
			}
			if (!value.trim().equals(value)) {
				validation.addError(fieldName, "Name cannot have leading or trailing spaces");
			}
		};
	}

	public static Validator<String> email() {
		return (validation, fieldName, value) -> {
			boolean allowLocal = false;
			boolean allowTld = true;
			if (!EmailValidator.getInstance(allowLocal, allowTld).isValid(value)) {
				validation.addError(fieldName, "Invalid email");
			}
		};
	}

	public static Validator<String> phoneNumber() {
		return (validation, fieldName, value) -> {
			final String PHONE_NUMBER_REGEX = "\\d{3}-?\\d{3}-?\\d{4}"; // XXX-XXX-XXXX
			if (!value.matches(PHONE_NUMBER_REGEX)) {
				validation.addError(fieldName, "Phone number is invalid, format XXX-XXX-XXXX");
			}
		};
	}

	public static <T> Validator<T> required() {
		return (validation, fieldName, value) -> {
			String rawValue = validation.value(fieldName);
			if (rawValue == null || rawValue.isEmpty()) {
				validation.addError(fieldName, "Can't be empty");
			}
		};
	}

	public static Validator<String> isOneOf(List<String> stringList) {
		return (validation, fieldName, value) -> {
			if (!stringList.contains(value)) {
				validation.addError(fieldName, "Expected field to be in " + stringList.toString());
			}
		};
	}

	public static Validator<Integer> greaterThan(int min) {
		return (validation, fieldName, value) -> {
			if (!(value > min)) {
				validation.addError(fieldName, "Must be greater than " + min);
			}
		};
	}

	public static Validator<Integer> lessThan(int max) {
		return (validation, fieldName, value) -> {
			if (!(value < max)) {
				validation.addError(fieldName, "Must be less than " + max);
			}
		};
	}

	public static Validator<String> strLength(int minLength, int maxLength) {
		return (validation, fieldName, value) -> {
			if (value.length() < minLength) {
				validation.addError(fieldName, "Must be at least " + minLength + " characters long");
			}
			if (value.length() > maxLength) {
				validation.addError(fieldName, "Must be no longer than " + maxLength + " characters");
			}
		};
	}

	public static Validator<String> regexMustMatch(Pattern pattern, String error) {
		return (validation, fieldName, value) -> {
			if (!pattern.matcher(value).matches()) {
				validation.addError(fieldName, error);
			}
		};
	}
}
