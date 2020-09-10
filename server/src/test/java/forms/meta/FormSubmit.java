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

import static io.restassured.RestAssured.given;

import com.diffplug.common.base.Preconditions;
import common.UrlEncodedPath;
import forms.api.FormDef;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import org.assertj.core.api.Assertions;
import org.jooby.Status;

public class FormSubmit {
	final TypedFormDef<?> def;
	final Map<String, String> map = new LinkedHashMap<>();

	private FormSubmit(TypedFormDef<?> def) {
		this.def = Objects.requireNonNull(def);
	}

	@SuppressWarnings({"unchecked", "rawtypes"})
	public static FormSubmit create(Class<? extends TypedFormDef> clazz) {
		TypedFormDef def = TypedFormDef.create(clazz);
		Preconditions.checkArgument(!def.actionUrl().equals(TypedFormDef.thisUrl()));
		return new FormSubmit(def);
	}

	@SuppressWarnings({"unchecked", "rawtypes"})
	public static FormSubmit create(Class<? extends TypedFormDef> clazz, String url) {
		TypedFormDef def = TypedFormDef.create(clazz);
		Preconditions.checkArgument(def.actionUrl().equals(TypedFormDef.thisUrl()));
		return new FormSubmit(new TypedFormDef(url, def.fields()) {
			@Override
			public Method method() {
				return def.method();
			}
		});
	}

	public <T> FormSubmit set(MetaField<T> field, T value) {
		return set(field.name(), field.parser().reverse().convert(value));
	}

	public <T> FormSubmit set(String name, String value) {
		map.put(name, value);
		return this;
	}

	public Response post() {
		return post(given());
	}

	public Response post(RequestSpecification req) {
		Assertions.assertThat(map.keySet()).isEqualTo(def.fieldNames());
		return doPost(req);
	}

	public Response postWithMissingFields() {
		return postWithMissingFields(given());
	}

	public Response postWithMissingFields(RequestSpecification req) {
		return doPost(req);
	}

	private Response doPost(RequestSpecification req) {
		Preconditions.checkArgument(def.method() == FormDef.Method.POST);
		Response response = req.redirects().follow(false).params(map).post(def.actionUrl());
		if (response.statusCode() == Status.SEE_OTHER.value()) {
			// send cookies when handling "SEE_OTHER" redirects
			return req.with().cookies(response.getDetailedCookies()).get(response.getHeader("location"));
		} else {
			return response;
		}
	}

	public Response postDebugCookies() {
		Assertions.assertThat(map.keySet()).isEqualTo(def.fieldNames());
		return given().redirects().follow(false).params(map).post(def.actionUrl());
	}

	public Response postDebugWithCookies(Map<String, ?> cookies) {
		Assertions.assertThat(map.keySet()).isEqualTo(def.fieldNames());
		return given().redirects().follow(false).cookies(cookies).params(map).post(def.actionUrl());
	}

	public Response get(RequestSpecification req) {
		Preconditions.checkArgument(def.method() == FormDef.Method.GET);
		UrlEncodedPath path = UrlEncodedPath.path(def.actionUrl());
		map.forEach(path::param);
		Response response = req.redirects().follow(false).urlEncodingEnabled(false).get(path.build());
		if (response.statusCode() == Status.SEE_OTHER.value()) {
			// send cookies when handling "SEE_OTHER" redirects
			return req.with().cookies(response.getDetailedCookies()).get(response.getHeader("location"));
		} else {
			return response;
		}
	}
}
