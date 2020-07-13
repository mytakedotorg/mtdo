/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
