/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import com.google.common.base.Preconditions;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import org.assertj.core.api.AbstractAssert;
import org.assertj.core.api.Assertions;

public class MetaFormValidationAssert extends AbstractAssert<MetaFormValidationAssert, MetaFormValidation> {
	public static <T> MetaFormValidationAssert assertThat(MetaFormValidation validation) {
		return new MetaFormValidationAssert(validation);
	}

	public static <T> MetaFormValidationAssert assertThat(Class<? extends MetaFormDef> formClazz, String... fieldsAndValues) {
		Map<String, String> params = toMap(fieldsAndValues);
		MetaFormValidation validation = MetaFormValidation.validate(formClazz, params);
		return new MetaFormValidationAssert(validation);
	}

	private MetaFormValidationAssert(MetaFormValidation actual) {
		super(actual, MetaFormValidationAssert.class);
	}

	public MetaFormValidationAssert hasFieldErrors(String... fieldErrors) {
		Map<String, String> expected = toMap(fieldErrors);
		Assertions.assertThat(actual.errorForField()).isEqualTo(expected);
		return this;
	}

	public MetaFormValidationAssert hasFormError(String formError) {
		Assertions.assertThat(actual.errorForForm()).isEqualTo(formError);
		Assertions.assertThat(actual.successForForm()).isNull();
		return this;
	}

	public MetaFormValidationAssert noError() {
		hasFieldErrors();
		Assertions.assertThat(actual.noErrors()).isTrue();
		return this;
	}

	public MetaFormValidationAssert hasFormSuccess(String formSuccess) {
		Assertions.assertThat(actual.successForForm()).isEqualTo(formSuccess);
		Assertions.assertThat(actual.errorForForm()).isNull();
		return this;
	}

	public MetaFormValidationAssert canGetAndSet(Class<?> clazz) throws Exception {
		for (MetaField<?> field : actual.def().fields()) {
			Method getter = clazz.getMethod("get" + MetaMap.cap(field.name()));
			Assertions.assertThat(getter.getReturnType()).isEqualTo(field.clazz());
			clazz.getMethod("set" + MetaMap.cap(field.name()), field.clazz());
		}
		return this;
	}

	private static Map<String, String> toMap(String... keysValues) {
		Map<String, String> map = new HashMap<>();
		Preconditions.checkArgument(keysValues.length % 2 == 0, "Should be in form 'key1', 'value1', 'key2', 'value2', ... so num args ought to be even");
		for (int i = 0; i < keysValues.length / 2; ++i) {
			String fieldName = keysValues[2 * i];
			String error = keysValues[2 * i + 1];
			map.put(fieldName, error);
		}
		return map;
	}
}
