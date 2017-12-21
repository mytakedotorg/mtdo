/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package forms.meta;

import forms.api.FormValidation;
import java.util.regex.Pattern;
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

	public static Validator<String> strLength(int minLength, int maxLength) {
		return (validation, fieldName, value) -> {
			if (value.length() < minLength) {
				validation.errorForField(fieldName, "Must be at least " + minLength + " characters long");
			}
			if (value.length() > maxLength) {
				validation.errorForField(fieldName, "Must be no longer than " + maxLength + " characters");
			}
		};
	}

	public static Validator<String> regexMustMatch(Pattern pattern, String error) {
		return (validation, fieldName, value) -> {
			if (!pattern.matcher(value).matches()) {
				validation.errorForField(fieldName, error);
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
}
