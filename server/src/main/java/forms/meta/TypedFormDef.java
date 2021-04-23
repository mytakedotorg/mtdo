/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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
import com.diffplug.common.collect.ImmutableSet;
import com.google.common.base.Converter;
import com.google.common.collect.Iterators;
import com.google.common.collect.Maps;
import common.UserException;
import forms.api.FormDef;
import forms.api.FormValidation;
import java.util.AbstractSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.jooby.Mutant;
import org.jooby.Request;

/** A {@link FormDef} based on {@link MetaField}. */
public abstract class TypedFormDef<Self extends TypedFormDef<Self>> implements FormDef {
	private final String actionUrl;
	protected Set<MetaField<?>> fields;

	protected TypedFormDef(String actionUrl, MetaField<?>... fields) {
		this.actionUrl = Objects.requireNonNull(actionUrl);
		this.fields = ImmutableSet.copyOf(fields);
	}

	TypedFormDef(String actionUrl, Set<MetaField<?>> fields) {
		this.actionUrl = Objects.requireNonNull(actionUrl);
		this.fields = fields;
	}

	public static String thisUrl() {
		return "";
	}

	@Override
	public final String actionUrl() {
		return actionUrl;
	}

	@Override
	public final Set<String> fieldNames() {
		return new AbstractSet<String>() {
			@Override
			public Iterator<String> iterator() {
				return Iterators.transform(fields().iterator(), MetaField::name);
			}

			@Override
			public int size() {
				return fields().size();
			}
		};
	}

	public final Set<MetaField<?>> fields() {
		return fields;
	}

	protected static Map<String, String> params(Request req) {
		return Maps.transformValues(req.params().toMap(), Mutant::value);
	}

	protected FormValidation.Sensitive<Self> parseMetaFieldsSkipNulls(Map<String, String> unparsed) {
		return parseMetaFields(unparsed, true);
	}

	protected FormValidation.Sensitive<Self> parseMetaFields(Map<String, String> unparsed) {
		return parseMetaFields(unparsed, false);
	}

	private FormValidation.Sensitive<Self> parseMetaFields(Map<String, String> unparsed, boolean skipNulls) {
		FormValidation.Sensitive<Self> validation = FormValidation.emptySensitive(this);
		for (MetaField<?> field : fields()) {
			try {
				Object value = field.parser().convert(unparsed.get(field.name()));
				// HTTP post of a false boolean just omits the param entirely (!!)
				if (value == null && field.clazz().equals(Boolean.class)) {
					value = false;
				}
				if (value == null) {
					if (skipNulls) {
						continue;
					} else {
						throw new UserException("Required");
					}
				} else {
					@SuppressWarnings("unchecked")
					Converter<Object, String> reverse = (Converter<Object, String>) field.parser().reverse();
					validation.set(field.name(), reverse.convert(value));
				}
			} catch (Exception e) {
				validation.addError(field, e.getMessage() == null ? e.getClass().getName() : e.getMessage());
				if (e.getMessage().equals("value")) {
					e.printStackTrace();
				}
			}
		}
		return validation;
	}

	@SuppressWarnings("unchecked")
	public static <T extends TypedFormDef<T>> T create(Class<T> clazz) {
		return (T) instantiated.computeIfAbsent(clazz, c -> {
			return (T) Errors.rethrow().get(() -> c.getDeclaredConstructor().newInstance());
		});
	}

	private static final ConcurrentHashMap<Class<?>, TypedFormDef<?>> instantiated = new ConcurrentHashMap<>();
}
