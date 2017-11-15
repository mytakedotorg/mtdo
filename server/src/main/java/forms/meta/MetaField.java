/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import com.google.common.base.Converter;
import java.util.Objects;

/** Represents a single form field.  Equality is based only on the name. */
public abstract class MetaField<T> {
	/** Creates a field for a string value. */
	public static MetaField<String> string(String name) {
		return new StringMetaField(name);
	}

	/** Creates a field for a boolean value. */
	public static MetaField<Boolean> bool(String name) {
		return new BooleanMetaField(name);
	}

	/** The internal name of the field (for HTML input labels). */
	public String name() {
		return name;
	}

	private final String name;

	public MetaField(String name) {
		this.name = Objects.requireNonNull(name);
	}

	@Override
	public String toString() {
		return name;
	}

	@Override
	public boolean equals(Object o) {
		if (o == this) {
			return true;
		} else if (o instanceof MetaField) {
			MetaField<?> other = (MetaField<?>) o;
			return other.name.endsWith(name);
		} else {
			return false;
		}
	}

	@Override
	public int hashCode() {
		return name.hashCode();
	}

	/** The bidirectional parser for the field. */
	public abstract Converter<String, T> parser();

	/** The class for this field. */
	public abstract Class<T> clazz();

	static class StringMetaField extends MetaField<String> {
		public StringMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, String> parser() {
			return Converter.identity();
		}

		@Override
		public Class<String> clazz() {
			return String.class;
		}
	}

	static class BooleanMetaField extends MetaField<Boolean> {
		public BooleanMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, Boolean> parser() {
			return converter;
		}

		@Override
		public Class<Boolean> clazz() {
			return Boolean.class;
		}

		static final Converter<String, Boolean> converter = new Converter<String, Boolean>() {
			static final String TRUE = "on";
			static final String FALSE = "off";

			@Override
			protected Boolean doForward(String a) {
				if (a.equals(TRUE)) {
					return true;
				} else if (a.equals(FALSE)) {
					return false;
				} else {
					throw new IllegalArgumentException("Must be either '" + TRUE + "' or '" + FALSE + "', was '" + a + "'.");
				}
			}

			@Override
			protected String doBackward(Boolean b) {
				return b.booleanValue() ? TRUE : FALSE;
			}
		};
	}
}
