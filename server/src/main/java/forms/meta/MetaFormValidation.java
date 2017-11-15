/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import forms.api.FormValidation;
import java.util.Map;
import org.jooby.Mutant;
import org.jooby.Request;

public class MetaFormValidation extends FormValidation<MetaMap> {
	@SafeVarargs
	public static MetaFormValidation validateOneOf(Mutant params, Class<? extends MetaFormDef>... formClazzes) {
		return validateOneOf(mutantToMap(params), formClazzes);
	}

	@SafeVarargs
	public static MetaFormValidation validateOneOf(Map<String, String> params, Class<? extends MetaFormDef>... formClazzes) {
		for (Class<? extends MetaFormDef> formClazz : formClazzes) {
			MetaFormDef formDef = MetaFormDef.create(formClazz);
			if (params.keySet().containsAll(formDef.fieldNames())) {
				return formDef.parseAndValidate(params);
			}
		}
		throw new IllegalArgumentException("None of the correct fields are present.");
	}

	/** Creates an empty form validation. */
	public static MetaFormValidation empty(Class<? extends MetaFormDef> formClazz) {
		return new MetaFormValidation(MetaFormDef.create(formClazz));
	}

	/** Performs validation on a MetaFormDef. */
	public static MetaFormValidation validate(Class<? extends MetaFormDef> formClazz, Mutant params) {
		return validate(formClazz, mutantToMap(params));
	}

	public static MetaFormValidation validate(Class<? extends MetaFormDef> formClazz, Map<String, String> params) {
		return MetaFormDef.create(formClazz).parseAndValidate(params);
	}

	static Map<String, String> mutantToMap(Mutant mutant) {
		return Maps.transformValues(mutant.toMap(), Mutant::value);
	}

	protected MetaFormValidation(MetaFormDef def) {
		super(def);
	}

	Map<String, String> errorForField() {
		return errorForField;
	}

	@Override
	public MetaFormDef def() {
		return (MetaFormDef) def;
	}

	public <R> MetaFormValidation init(MetaField<R> field, R value) {
		String str = field.parser().reverse().convert(value);
		init(field.name(), str);
		return this;
	}

	public <R> R init(MetaField<R> field) {
		String value = init(field.name());
		return field.parser().convert(value);
	}

	@SuppressWarnings("unchecked")
	public final MetaFormValidation initFromGettersOf(Object value) {
		MetaMap metaMap = MetaMap.buildFrom(value, def());
		for (MetaField<?> field : metaMap.keySet()) {
			init((MetaField<Object>) field, metaMap.get(field));
		}
		return this;
	}

	@SuppressWarnings("unchecked")
	@SafeVarargs
	public final MetaFormValidation keep(MetaField<?>... fields) {
		for (MetaField<?> field : fields) {
			Preconditions.checkState(parsedValue().keySet().contains(field), "Expected %s to contain %s", parsedValue().keySet(), field);
			init((MetaField<Object>) field, (Object) parsedValue().get(field));
		}
		return this;
	}

	public final MetaFormValidation keepAll() {
		for (MetaField<?> field : def().fields()) {
			keep(field);
		}
		return this;
	}

	public MetaFormValidation errorForField(MetaField<?> field, String error) {
		errorForField(field.name(), error);
		return this;
	}

	public <T> T parsed(MetaField<T> field) {
		return parsedValue().get(field);
	}

	public MetaFormValidation initAllIfPresent(Request req) {
		for (MetaField<?> field : def().fields()) {
			initIfPresent(req, field);
		}
		return this;
	}

	@SuppressWarnings("unchecked")
	public MetaFormValidation initIfPresent(Request req, MetaField<?>... fields) {
		for (MetaField<?> field : fields) {
			Mutant value = req.param(field.name());
			if (value.isSet()) {
				init((MetaField<Object>) field, (Object) field.parser().convert(value.value()));
			}
		}
		return this;
	}
}
