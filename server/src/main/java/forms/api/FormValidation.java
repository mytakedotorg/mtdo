/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2021 MyTake.org, Inc.
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

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.collect.ImmutableMap;
import forms.meta.MetaField;
import forms.meta.PostForm;
import forms.meta.TypedFormDef;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.jetbrains.annotations.Nullable;

/**
 * Maintains per-field errors, along with an error for the entire
 * form and a success message for the entire form.
 */
public class FormValidation<F extends FormDef> {
	private final F def;
	private final String formError;
	private final ImmutableMap<String, String> values, errors;

	private FormValidation(F def, @Nullable String formError,
			ImmutableMap<String, String> values, ImmutableMap<String, String> errors) {
		this.def = def;
		this.formError = formError;
		this.values = values;
		this.errors = errors;
	}

	public FormDef def() {
		return def;
	}

	@Nullable
	public String formError() {
		return formError;
	}

	public ImmutableMap<String, String> values() {
		return values;
	}

	public ImmutableMap<String, String> errors() {
		return errors;
	}

	@Nullable
	public String value(String key) {
		return values.get(key);
	}

	@Nullable
	public <T> T value(MetaField<T> key) {
		return key.parser().convert(values.get(key.name()));
	}

	public FormMarkup<F> markup() {
		return new FormMarkup<>(def, this);
	}

	/////////////
	// BUILDER //
	/////////////
	@SuppressWarnings("unchecked")
	public static <F extends TypedFormDef<F>> Builder<F> emptyBuilder(TypedFormDef<F> def) {
		return new Builder<F>((F) def, null, ImmutableMap.of(), ImmutableMap.of());
	}

	@SuppressWarnings("unchecked")
	public static <F extends TypedFormDef<F>> Sensitive<F> emptySensitive(TypedFormDef<F> def) {
		return new Sensitive<F>((F) def, null, ImmutableMap.of(), ImmutableMap.of());
	}

	/** Builds a form valiation. */
	public static class Builder<F extends FormDef> extends AbstractBuilder<F, Builder<F>> implements PostForm.ValidateResult<F> {
		private Builder(F def, String formError, ImmutableMap<String, String> values, ImmutableMap<String, String> errors) {
			super(def, formError, values, errors);
		}

		public FormValidation<F> build() {
			return new FormValidation<F>(def, formError, values, errors);
		}
	}

	/** Represents a form valiation containing sensitive information, indicating that the programmer needs to call a keep() method. */
	public static class Sensitive<F extends FormDef> extends AbstractBuilder<F, Sensitive<F>> {
		private Sensitive(F def, String formError, ImmutableMap<String, String> values, ImmutableMap<String, String> errors) {
			super(def, formError, values, errors);
		}

		public Builder<F> keepAll() {
			return new Builder<>(def, formError, values, errors);
		}

		public Builder<F> keepNone() {
			return new Builder<>(def, formError, ImmutableMap.of(), errors);
		}

		private Builder<F> keep(Predicate<String> toKeep) {
			ImmutableMap.Builder<String, String> builder = ImmutableMap.builder();
			for (Map.Entry<String, String> entry : values.entrySet()) {
				if (toKeep.test(entry.getKey())) {
					builder.put(entry);
				}
			}
			return new Builder<>(def, formError, builder.build(), errors);
		}

		public Builder<F> keep(MetaField<?>... fields) {
			return keep(Arrays.asList(fields));
		}

		public Builder<F> keep(Iterable<MetaField<?>> fields) {
			return keep(fieldName -> {
				for (MetaField<?> field : fields) {
					if (field.name().equals(fieldName)) {
						return true;
					}
				}
				return false;
			});
		}
	}

	private static <K, V> ImmutableMap<K, V> minus(ImmutableMap<K, V> map, K toRemove) {
		if (!map.containsKey(toRemove)) {
			return map;
		}
		if (map.size() == 1) {
			return ImmutableMap.of();
		}
		ImmutableMap.Builder<K, V> builder = ImmutableMap.builder(map.size() - 1);
		for (Map.Entry<K, V> entry : map.entrySet()) {
			if (!entry.getKey().equals(toRemove)) {
				builder.put(entry);
			}
		}
		return builder.build();
	}

	private static <K, V> ImmutableMap<K, V> plus(ImmutableMap<K, V> map, K key, V value) {
		if (map.isEmpty()) {
			return ImmutableMap.of(key, value);
		} else {
			ImmutableMap.Builder<K, V> builder;
			if (map.containsKey(key)) {
				builder = ImmutableMap.builder(map.size());
				for (Map.Entry<K, V> entry : map.entrySet()) {
					if (entry.getKey().equals(key)) {
						builder.put(key, value);
					} else {
						builder.put(entry);
					}
				}
			} else {
				builder = ImmutableMap.builder(map.size() + 1);
				builder.putAll(map);
				builder.put(key, value);
			}
			return builder.build();
		}
	}

	public abstract static class AbstractBuilder<F extends FormDef, Self extends AbstractBuilder<F, Self>> {
		protected final F def;
		@Nullable
		protected String formError;
		protected ImmutableMap<String, String> values, errors;

		protected AbstractBuilder(F def, @Nullable String formError,
				ImmutableMap<String, String> values, ImmutableMap<String, String> errors) {
			this.def = Objects.requireNonNull(def);
			this.formError = formError;
			this.values = Objects.requireNonNull(values);
			this.errors = Objects.requireNonNull(errors);
		}

		@Override
		public String toString() {
			StringBuilder builder = new StringBuilder();
			builder.append(def.toString());
			if (formError != null) {
				builder.append(" formError=" + formError);
			}
			errors.forEach((key, value) -> builder.append(" " + key + "Error=" + value));
			values.forEach((key, value) -> builder.append(" " + key + "=" + value));
			return builder.toString();
		}

		public F def() {
			return def;
		}

		@SuppressWarnings("unchecked")
		public Self returnThis() {
			return (Self) this;
		}

		public Self set(String field, String value) {
			Objects.requireNonNull(field, "field");
			Objects.requireNonNull(value, "value");
			values = plus(values, field, value);
			return returnThis();
		}

		public Self setIfNull(String field, String value) {
			Objects.requireNonNull(field, "field");
			Objects.requireNonNull(value, "value");
			if (values.get(field) == null) {
				values = plus(values, field, value);
			}
			return returnThis();
		}

		public Self addError(String field, String error) {
			Preconditions.checkArgument(def.fieldNames().contains(field), field + " is not a valid field name. allowed=" + def.fieldNames());
			Objects.requireNonNull(field, "field");
			Objects.requireNonNull(error, "error");
			String existingError = errors.get(field);
			if (existingError == null) {
				errors = plus(errors, field, error);
			} else {
				errors = plus(errors, field, existingError + "\n" + error);
			}
			return returnThis();
		}

		public <T> Self clearErrors(String field) {
			errors = minus(errors, field);
			return returnThis();
		}

		@Nullable
		public String value(String key) {
			return values.get(key);
		}

		public boolean valuePresent(String key) {
			String value = values.get(key);
			return value != null && !value.isEmpty();
		}

		@Nullable
		public String error(String key) {
			return errors.get(key);
		}

		public boolean noErrors() {
			return errors.isEmpty() && formError == null;
		}

		public Self formError(String formError) {
			this.formError = Objects.requireNonNull(formError, "formError");
			return returnThis();
		}

		public Self summarizeErrorsIfNecessary() {
			if (!errors.isEmpty() && formError == null) {
				formError = pluralize(errors.keySet(), "Error", "Errors") + " in " + fieldsWithErrors() + ".";
			}
			return returnThis();
		}

		private String fieldsWithErrors() {
			Preconditions.checkState(!errors.isEmpty());
			return def.fieldNames().stream()
					.filter(errors.keySet()::contains)
					.collect(Collectors.joining(", "));
		}

		private static String pluralize(Collection<?> c, String singular, String plural) {
			return c.size() == 1 ? singular : plural;
		}

		/////////////////////////
		// add MetaField sugar //
		/////////////////////////
		public <T> Self set(MetaField<T> field, T value) {
			return set(field.name(), field.parser().reverse().convert(value));
		}

		public <T> Self setIfNull(MetaField<T> field, T value) {
			return setIfNull(field.name(), field.parser().reverse().convert(value));
		}

		public <T> Self addError(MetaField<T> field, String error) {
			return addError(field.name(), error);
		}

		@Nullable
		public <T> T value(MetaField<T> key) {
			return key.parser().convert(value(key.name()));
		}

		public boolean valuePresent(MetaField<?> key) {
			return valuePresent(key.name());
		}

		@Nullable
		public String error(MetaField<?> key) {
			return error(key.name());
		}

		public <T> Self clearErrors(MetaField<?> key) {
			return clearErrors(key.name());
		}
	}
}
