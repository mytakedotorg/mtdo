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

import com.diffplug.common.base.Errors;
import com.google.common.base.Converter;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.ParseException;
import java.util.Arrays;
import java.util.Objects;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.jooby.Mutant;
import org.jooby.Request;

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

	/** Creates a field for a boolean value. */
	public static MetaField<Long> numLong(String name) {
		return new LongMetaField(name);
	}

	/** Creates a field for a boolean value. */
	public static MetaField<Integer> numInt(String name) {
		return new IntMetaField(name);
	}

	/** Creates a field for a boolean value. */
	public static MetaField<BigDecimal> bigDecimal(String name) {
		return new BigDecimalMetaField(name);
	}

	public static MetaField<Timestamp> timestamp(String name) {
		return new TimestampMetaField(name);
	}

	public static MetaField<Timestamp> timestampJdbc(String name) {
		return new TimestampJdbcMetaField(name);
	}

	public static <T extends Enum<T>> MetaField<T> enumType(String name, Class<T> clazz) {
		return new EnumMetaField<>(name, clazz);
	}

	public static MetaField<long[]> spaceDelimitedLongs(String name) {
		return new SpaceDelimitedLongs(name);
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

	/** Parses a value from a request. */
	public T parse(Request req) {
		String value = req.param(name).value();
		return parser().convert(value);
	}

	public T parseOrDefault(Request req, Supplier<T> defaultValue) {
		Mutant mutant = req.param(name);
		if (mutant.isSet()) {
			return parser().convert(mutant.value());
		} else {
			return defaultValue.get();
		}
	}

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

	public static String boolConst(boolean value) {
		return value ? BooleanMetaField.TRUE : BooleanMetaField.FALSE;
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

		static final String TRUE = "on";
		static final String FALSE = "off";

		static final Converter<String, Boolean> converter = new Converter<String, Boolean>() {
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

	static class LongMetaField extends MetaField<Long> {
		public LongMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, Long> parser() {
			return converter;
		}

		@Override
		public Class<Long> clazz() {
			return Long.class;
		}

		static final Converter<String, Long> converter = new Converter<String, Long>() {
			@Override
			protected Long doForward(String a) {
				return Long.parseLong(a);
			}

			@Override
			protected String doBackward(Long b) {
				return Long.toString(b);
			}
		};
	}

	static class IntMetaField extends MetaField<Integer> {
		public IntMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, Integer> parser() {
			return converter;
		}

		@Override
		public Class<Integer> clazz() {
			return Integer.class;
		}

		static final Converter<String, Integer> converter = new Converter<String, Integer>() {
			@Override
			protected Integer doForward(String a) {
				return Integer.parseInt(a);
			}

			@Override
			protected String doBackward(Integer b) {
				return Integer.toString(b);
			}
		};
	}

	static class BigDecimalMetaField extends MetaField<BigDecimal> {
		public BigDecimalMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, BigDecimal> parser() {
			return converter;
		}

		@Override
		public Class<BigDecimal> clazz() {
			return BigDecimal.class;
		}

		static final Converter<String, BigDecimal> converter = new Converter<String, BigDecimal>() {
			@Override
			protected BigDecimal doForward(String a) {
				return new BigDecimal(a);
			}

			@Override
			protected String doBackward(BigDecimal b) {
				return b.toPlainString();
			}
		};
	}

	static class TimestampMetaField extends MetaField<Timestamp> {
		public TimestampMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, Timestamp> parser() {
			return converter;
		}

		@Override
		public Class<Timestamp> clazz() {
			return Timestamp.class;
		}

		static final Converter<String, Timestamp> converter = new Converter<String, Timestamp>() {
			@Override
			protected Timestamp doForward(String a) {
				try {
					return new Timestamp(common.Time.formatHTML().parse(a).getTime());
				} catch (ParseException e) {
					throw Errors.asRuntime(e);
				}
			}

			@Override
			protected String doBackward(Timestamp b) {
				return common.Time.formatHTML().format(b);
			}
		};
	}

	static class TimestampJdbcMetaField extends MetaField<Timestamp> {
		public TimestampJdbcMetaField(String name) {
			super(name);
		}

		@Override
		public Converter<String, Timestamp> parser() {
			return converter;
		}

		@Override
		public Class<Timestamp> clazz() {
			return Timestamp.class;
		}

		static final Converter<String, Timestamp> converter = new Converter<String, Timestamp>() {
			@Override
			protected Timestamp doForward(String a) {
				return Timestamp.valueOf(a);
			}

			@Override
			protected String doBackward(Timestamp b) {
				return b.toString();
			}
		};
	}

	static class EnumMetaField<T extends Enum<T>> extends MetaField<T> {
		private final Class<T> clazz;
		private final Converter<String, T> converter;

		public EnumMetaField(String name, Class<T> clazz) {
			super(name);
			this.clazz = clazz;
			this.converter = new Converter<String, T>() {
				@Override
				protected T doForward(String a) {
					return Enum.valueOf(clazz, a);
				}

				@Override
				protected String doBackward(T b) {
					return b.name();
				}
			};
		}

		@Override
		public Converter<String, T> parser() {
			return converter;
		}

		@Override
		public Class<T> clazz() {
			return clazz;
		}
	}

	static class SpaceDelimitedLongs extends MetaField<long[]> {
		public SpaceDelimitedLongs(String name) {
			super(name);
		}

		@Override
		public Converter<String, long[]> parser() {
			return converter;
		}

		@Override
		public Class<long[]> clazz() {
			return long[].class;
		}

		static final Converter<String, long[]> converter = new Converter<String, long[]>() {
			@Override
			protected long[] doForward(String a) {
				return Arrays.stream(a.split(" "))
						.map(String::trim)
						.mapToLong(Long::parseLong)
						.toArray();
			}

			@Override
			protected String doBackward(long[] b) {
				return Arrays.stream(b)
						.mapToObj(Long::toString)
						.collect(Collectors.joining(" "));
			}
		};
	}
}
