/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package forms.meta;

import static io.restassured.RestAssured.given;

import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import org.assertj.core.api.Assertions;

public class MetaFormSubmit {
	final MetaFormDef def;
	final Map<String, String> map = new HashMap<>();

	MetaFormSubmit(MetaFormDef def) {
		this.def = Objects.requireNonNull(def);
	}

	public static MetaFormSubmit create(Class<? extends MetaFormDef> clazz) {
		return new MetaFormSubmit(MetaFormDef.create(clazz));
	}

	public <T> MetaFormSubmit set(MetaField<T> field, T value) {
		map.put(field.name(), field.parser().reverse().convert(value));
		return this;
	}

	public MetaFormSubmit setRemainingEmptyAndFalse() {
		return setRemaining(String.class, "").setRemaining(Boolean.class, false);
	}

	public <T> MetaFormSubmit setRemaining(Class<T> clazz, T value) {
		for (MetaField<?> field : def.fields()) {
			if (!map.containsKey(field.name()) && field.clazz().equals(clazz)) {
				@SuppressWarnings("unchecked")
				MetaField<T> fieldCast = (MetaField<T>) field;
				map.put(field.name(), fieldCast.parser().reverse().convert(value));
			}
		}
		return this;
	}

	public Response post(String url) {
		return post(url, given());
	}

	public Response post(String url, RequestSpecification req) {
		Assertions.assertThat(def.fieldNames()).isEqualTo(map.keySet());
		return req.params(map).post(url);
	}
}
