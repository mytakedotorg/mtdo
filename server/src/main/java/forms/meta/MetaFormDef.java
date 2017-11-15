/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import com.diffplug.common.base.Errors;
import com.google.common.collect.Iterators;
import forms.api.FormDef;
import java.util.AbstractSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.jooby.Request;
import org.jooby.Response;

/** A {@link FormDef} based on {@link MetaField}. */
public abstract class MetaFormDef implements FormDef {
	@Override
	public Set<String> fieldNames() {
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

	public abstract Set<MetaField<?>> fields();

	MetaFormValidation parseAndValidate(Map<String, String> unparsed) {
		MetaFormValidation validation = new MetaFormValidation(this);
		MetaMap.Builder builder = MetaMap.builder();
		for (MetaField<?> field : fields()) {
			try {
				Object value = field.parser().convert(unparsed.get(field.name()));
				// HTTP post of a false boolean just omits the param entirely (!!)
				if (value == null && field.clazz().equals(Boolean.class)) {
					value = false;
				}
				builder.init(field, value);
			} catch (Exception e) {
				validation.errorForField(field, e.getMessage() == null ? e.getClass().getName() : e.getMessage());
			}
		}
		validation.parsedValue(builder.build());
		validate(validation);
		if (!validation.noErrors()) {
			validation.summarizeErrorsIfNecessary();
		}
		return validation;
	}

	protected abstract void validate(MetaFormValidation validation);

	/** A form which can handle its own successful results. */
	public static abstract class HandleValid extends MetaFormDef {
		/** Returns true if rsp has been set. */
		public abstract boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable;

		/**
		 * Validates the request / response using the given list of HandleValids.
		 * 
		 * Returns an empty list if the response was set by one of the forms correctly. 
		 */
		@SafeVarargs
		public static List<MetaFormValidation> validation(Request req, Response rsp, Class<? extends HandleValid>... formClazzes) throws Throwable {
			Map<String, String> params = MetaFormValidation.mutantToMap(req.params());
			List<MetaFormValidation> list = new ArrayList<>(formClazzes.length);
			for (Class<? extends HandleValid> formClazz : formClazzes) {
				MetaFormDef.HandleValid formDef = MetaFormDef.create(formClazz);
				if (params.keySet().containsAll(formDef.fieldNames())) {
					MetaFormValidation validation = formDef.parseAndValidate(params);
					if (validation.noErrors() && formDef.handleSuccessful(validation, req, rsp)) {
						return Collections.emptyList();
					} else {
						list.add(validation);
					}
				} else {
					list.add(MetaFormValidation.empty(formClazz));
				}
			}
			return list;
		}
	}

	@SuppressWarnings("unchecked")
	public static <T extends MetaFormDef> T create(Class<T> clazz) {
		return (T) instantiated.computeIfAbsent(clazz, c -> {
			return Errors.rethrow().get(clazz::newInstance);
		});
	}

	private static final ConcurrentHashMap<Class<?>, MetaFormDef> instantiated = new ConcurrentHashMap<>();
}
