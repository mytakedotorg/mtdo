/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import forms.api.FormValidation;
import org.apache.commons.validator.routines.EmailValidator;

public interface Validator<T> {
	void validate(FormValidation<?> validation, String fieldName, T value);

	default void validate(MetaFormValidation validation, MetaField<T> field) {
		if (validation.parsedValue().keySet().contains(field)) {
			validate(validation, field.name(), validation.parsedValue().get(field));
		} else {
			validation.errorForField(field, "Missing");
		}
	}

	public static Validator<String> integerBetween(int min, int max) {
		return (validation, fieldName, value) -> {
			try {
				int parsed = Integer.parseInt(value.trim());
				if (parsed < min) {
					validation.errorForField(fieldName, "Must be greater than " + min);
				} else if (parsed > max) {
					validation.errorForField(fieldName, "Must be less than " + max);
				}
			} catch (IllegalArgumentException e) {
				validation.errorForField(fieldName, "Must be an integer");
			}
		};
	}

	public static Validator<String> name() {
		return (validation, fieldName, value) -> {
			if (value.isEmpty()) {
				validation.errorForField(fieldName, "Name can't be empty");
			}
			if (!value.trim().equals(value)) {
				validation.errorForField(fieldName, "Name cannot have leading or trailing spaces");
			}
		};
	}

	public static Validator<String> email() {
		return (validation, fieldName, value) -> {
			if (!EmailValidator.getInstance().isValid(value)) {
				validation.errorForField(fieldName, "Invalid email");
			}
		};
	}

	public static Validator<String> phoneNumber() {
		return (validation, fieldName, value) -> {
			final String PHONE_NUMBER_REGEX = "\\d{3}-\\d{3}-\\d{4}"; // XXX-XXX-XXXX
			if (!value.matches(PHONE_NUMBER_REGEX)) {
				validation.errorForField(fieldName, "Phone number is invalid, format XXX-XXX-XXXX");
			}
		};
	}
}
