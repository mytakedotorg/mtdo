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

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.collect.ImmutableList;
import com.diffplug.common.collect.Immutables;
import common.CustomRockerModel;
import forms.api.FormDef;
import forms.api.FormValidation;
import forms.api.RockerRaw;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.jooby.Cookie;
import org.jooby.Request;
import org.jooby.Response;
import org.jooby.Router;
import org.jooby.Status;
import org.jooq.UpdatableRecord;

public abstract class PostForm<Self extends PostForm<Self>> extends TypedFormDef<Self> {
	protected PostForm(String actionUrl, MetaField<?>... fields) {
		super(actionUrl, fields);
	}

	PostForm(String actionUrl, Set<MetaField<?>> fields) {
		super(actionUrl, fields);
	}

	@Override
	public final Method method() {
		return Method.POST;
	}

	/** On success, we return a URL to redirect to.  On failure, we return form error messages and field values. */
	protected abstract ValidateResult<Self> validate(Request req, FormValidation.Sensitive<Self> fromUser);

	/** Populates the initial values for the given form. */
	protected FormValidation<Self> initialGet(Request req, Map<String, String> params) {
		return FormValidation.emptyBuilder(this).build();
	}

	public static <F extends PostForm<F>> void hook(Router router, Class<F> formClass, Throwing.BiFunction<Request, FormValidation<F>, CustomRockerModel> render) {
		PostForm<F> formDef = create(formClass);
		hook(router, formDef, formDef.actionUrl(), render);
	}

	protected static <F extends PostForm<F>> void hook(Router router, PostForm<F> formDef, String route, Throwing.BiFunction<Request, FormValidation<F>, CustomRockerModel> render) {
		router.get(route, req -> {
			return render.apply(req, formDef.initialGet(req, params(req)));
		});
		router.post(route, (req, rsp) -> {
			ValidateResult<F> result = formDef.parseAndValidate(req, params(req));
			if (result.isRedirect()) {
				result.redirect().sendRedirect(rsp);
			} else {
				rsp.send(render.apply(req, result.builder().build()));
			}
		});
	}

	/** Parses and passes to validate only if all params parsed their MetaFields correctly. */
	private ValidateResult<Self> parseAndValidate(Request req, Map<String, String> params) {
		FormValidation.Sensitive<Self> fromUser = parseMetaFields(params);
		if (!fromUser.noErrors()) {
			fromUser.summarizeErrorsIfNecessary();
			return fromUser.keepNone();
		} else {
			return validate(req, fromUser);
		}
	}

	//////////////////////////////////////////////////////////////////////
	// Long-winded sum type for "string | PrgFormValidation.Builder<F>" //
	//////////////////////////////////////////////////////////////////////
	public interface ValidateResult<F extends FormDef> {
		public static <F extends FormDef> ValidateResult<F> redirectToSelf(Request req) {
			return redirect(req.rawPath());
		}

		public static <F extends FormDef> ValidateResult<F> redirect(String url) {
			return redirect(url, ImmutableList.of());
		}

		public static <F extends FormDef> ValidateResult<F> redirect(String url, List<Cookie> cookies) {
			return new ValidateResultRedirect<>(url, cookies);
		}

		default boolean isRedirect() {
			return this instanceof ValidateResultRedirect;
		}

		default ValidateResultRedirect<F> redirect() {
			return ((ValidateResultRedirect<F>) this);
		}

		default FormValidation.Builder<F> builder() {
			return (FormValidation.Builder<F>) this;
		}
	}

	private static class ValidateResultRedirect<F extends FormDef> implements ValidateResult<F> {
		private final String url;
		private final List<Cookie> cookies;

		public ValidateResultRedirect(String url, List<Cookie> cookies) {
			this.url = url;
			this.cookies = cookies;
		}

		void sendRedirect(Response rsp) throws Throwable {
			cookies.forEach(rsp::cookie);
			rsp.redirect(Status.SEE_OTHER, url);
		}
	}

	///////////////////////////////////
	// Hook mulltiple forms at once. //
	///////////////////////////////////
	@SafeVarargs
	public static void hookMultiple(Router router, Throwing.BiFunction<Request, Validations, CustomRockerModel> render, Class<? extends PostForm<?>>... formClasses) {
		MultiFormGetPost multiRoute = new MultiFormGetPost(render, createList(formClasses));
		String url = multiRoute.url();
		router.get(url, multiRoute::get);
		router.post(url, multiRoute::post);
	}

	@SafeVarargs
	public static void hookMultiple(Router router, String url, Throwing.BiFunction<Request, Validations, CustomRockerModel> render, Class<? extends PostForm<?>>... formClasses) {
		MultiFormGetPost multiRoute = new MultiFormGetPost(render, createList(formClasses));
		Preconditions.checkArgument(multiRoute.url().equals(thisUrl()));
		router.get(url, multiRoute::get);
		router.post(url, multiRoute::post);
	}

	public static class Validations {
		private final Map<PostForm<?>, FormValidation<?>> validations;

		private Validations(Map<PostForm<?>, FormValidation<?>> validations) {
			this.validations = Objects.requireNonNull(validations);
		}

		@SuppressWarnings("unchecked")
		public <F extends PostForm<F>> FormValidation<F> get(Class<F> clazz) {
			return (FormValidation<F>) Objects.requireNonNull(validations.get(PostForm.create(clazz)));
		}

		public <R extends UpdatableRecord<R>> RockerRaw get(Crud<R> crud, Request req) {
			@SuppressWarnings("unchecked")
			FormValidation<Crud<R>> validation = (FormValidation<Crud<R>>) validations.get(crud);
			return crud.form(req, validation);
		}
	}

	static class MultiFormGetPost {
		private final Throwing.BiFunction<Request, Validations, CustomRockerModel> render;
		private final Map<PostForm<?>, List<String>> formToFieldNames = new LinkedHashMap<>();

		public String url() {
			String url = null;
			for (PostForm<?> form : formToFieldNames.keySet()) {
				if (url == null) {
					url = form.actionUrl();
				} else {
					String thisFormUrl = form.actionUrl();
					Preconditions.checkArgument(thisFormUrl.equals(url), "Form %s has URL %s, but others have %s.", form.getClass(), thisFormUrl, url);
				}
			}
			return url;
		}

		MultiFormGetPost(Throwing.BiFunction<Request, Validations, CustomRockerModel> render, List<PostForm<?>> forms) {
			this.render = render;
			for (PostForm<?> form : forms) {
				List<String> stringFieldNames = new ArrayList<String>(form.fieldNames().size());
				for (MetaField<?> field : form.fields()) {
					if (!field.clazz().getCanonicalName().equals("java.lang.Boolean")) {
						stringFieldNames.add(field.name());
					}
				}
				formToFieldNames.forEach((def, fields) -> {
					if (fields.containsAll(stringFieldNames) || stringFieldNames.containsAll(fields)) {
						throw new AssertionError("Form " + def.getClass() + " and " + form + "  are indistinguishable at runtime, because their non-boolean fields are both: " + stringFieldNames);
					}
				});
				formToFieldNames.put(form, stringFieldNames);
			}
		}

		Object get(Request req) throws Throwable {
			Map<String, String> params = params(req);
			Map<PostForm<?>, FormValidation<?>> validations = formToFieldNames.keySet().stream()
					.collect(Immutables.toMap(form -> form, form -> form.initialGet(req, params)));
			return render.apply(req, new Validations(validations));
		}

		void post(Request req, Response rsp) throws Throwable {
			Map<String, String> params = params(req);
			Map<PostForm<?>, FormValidation<?>> validations = new LinkedHashMap<>();
			boolean formIsFound = false;
			for (PostForm<?> form : formToFieldNames.keySet()) {
				List<String> fields = formToFieldNames.get(form);
				if (formIsFound || !params.keySet().containsAll(fields)) {
					validations.put(form, FormValidation.emptyBuilder(form).build());
				} else {
					ValidateResult<?> result = form.parseAndValidate(req, params);
					if (result.isRedirect()) {
						result.redirect().sendRedirect(rsp);
						return;
					} else {
						formIsFound = true;
						validations.put(form, result.builder().build());
					}
				}
			}
			rsp.send(render.apply(req, new Validations(validations)));
		}
	}

	@SafeVarargs
	@SuppressWarnings({"unchecked", "rawtypes"})
	public static List<PostForm<?>> createList(Class<? extends PostForm>... postClasses) {
		List<PostForm<?>> forms = new ArrayList<>(postClasses.length);
		for (Class<? extends PostForm> postClass : postClasses) {
			forms.add(TypedFormDef.create(postClass));
		}
		return forms;
	}
}
