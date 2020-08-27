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

import com.diffplug.common.base.Throwing;
import common.CustomRockerModel;
import forms.api.FormFieldBuilder;
import forms.api.FormMarkup;
import forms.api.FormValidation;
import forms.api.FormValidation.Sensitive;
import forms.api.RockerRaw;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiFunction;
import org.jooby.Request;
import org.jooby.Router;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.TableField;
import org.jooq.UpdatableRecord;
import org.jooq.impl.TableImpl;

public class Crud<R extends UpdatableRecord<R>> extends PostForm<Crud<R>> {
	private final TableImpl<R> table;
	private final BiFunction<DSLContext, Request, R> rowGetter;

	private Crud(TableImpl<R> table, BiFunction<DSLContext, Request, R> rowGetter) {
		super(PostForm.thisUrl(), new HashSet<>());
		this.table = Objects.requireNonNull(table);
		this.rowGetter = Objects.requireNonNull(rowGetter);
	}

	public static <R extends UpdatableRecord<R>> Crud<R> crud(TableImpl<R> table, BiFunction<DSLContext, Request, R> rowGetter) {
		return new Crud<>(table, rowGetter);
	}

	public class Field<T> {
		String label;
		String htmlInputType;
		TableField<R, T> dbField;
		MetaField<T> formField;

		public Field(String label, String htmlInputType, TableField<R, T> dbField, MetaField<T> formField) {
			this.label = label;
			this.htmlInputType = htmlInputType;
			this.dbField = dbField;
			this.formField = formField;
		}

		private void setFormToDb(FormValidation.Builder<Crud<R>> validation, Record db) {
			validation.set(formField, db.get(dbField));
		}

		private void setDbToForm(FormValidation.Sensitive<Crud<R>> validation, Record db) {
			db.set(dbField, validation.value(formField));
		}
	}

	private List<Field<?>> fields = new ArrayList<>();

	private <T> Crud<R> field(String label, String htmlInputType, TableField<R, T> dbField, MetaField<T> formField) {
		Field<T> newField = new Field<>(label, htmlInputType, dbField, formField);
		fields.add(newField);
		super.fields.add(newField.formField);
		return this;
	}

	public Crud<R> fieldString(String label, TableField<R, String> dbField) {
		return field(label, "text", dbField, MetaField.string(dbField.getName()));
	}

	public Crud<R> fieldStringMultiline(String label, TableField<R, String> dbField) {
		return field(label, FormFieldBuilder.TEXTAREA, dbField, MetaField.string(dbField.getName()));
	}

	public Crud<R> fieldLong(String label, TableField<R, Long> dbField) {
		return field(label, "number", dbField, MetaField.numLong(dbField.getName()));
	}

	public Crud<R> fieldInt(String label, TableField<R, Integer> dbField) {
		return field(label, "number", dbField, MetaField.numInt(dbField.getName()));
	}

	public Crud<R> fieldBigDecimal(String label, TableField<R, BigDecimal> dbField) {
		return field(label, "number", dbField, MetaField.bigDecimal(dbField.getName()));
	}

	public Crud<R> fieldBool(String label, TableField<R, Boolean> dbField) {
		return field(label, "checkbox", dbField, MetaField.bool(dbField.getName()));
	}

	RockerRaw form(Request req, FormValidation<Crud<R>> validation) {
		RockerRaw result = new RockerRaw();
		FormMarkup<Crud<R>> markup = validation.markup().standardPolicies();
		result.appendRocker(markup.openForm());
		result.appendRocker(markup.formError());
		for (Field<?> field : fields) {
			result.appendRaw("<div class=\"form__group\">");
			result.appendRocker(markup.field(field.formField).errorSpan().label(field.label).input(field.htmlInputType));
			result.appendRaw("</div>");
		}
		result.appendRaw("<input type=\"hidden\" name=\"" + CRUD_HIDDEN_FIELD + "\" value=\"" + table.getName() + "\">\n");
		result.appendRaw("<input type=\"submit\" class=\"btn btn-success\" value=\"Save\">\n");
		result.appendRocker(markup.closeForm());
		return result;
	}

	private static final String CRUD_HIDDEN_FIELD = "crudTable";

	@Override
	protected ValidateResult<Crud<R>> validate(Request req, Sensitive<Crud<R>> fromUser) {
		// store from post
		try (DSLContext dsl = req.require(DSLContext.class)) {
			R record = rowGetter.apply(dsl, req);
			for (Field<?> field : fields) {
				field.setDbToForm(fromUser, record);
			}
			record.store();
		}
		return ValidateResult.redirectToSelf(req);
	}

	@Override
	protected FormValidation<Crud<R>> initialGet(Request req, Map<String, String> params) {
		// init form from db
		FormValidation.Builder<Crud<R>> validation = FormValidation.emptyBuilder(this);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			R record = rowGetter.apply(dsl, req);
			if (record == null) {
				return validation.build();
			}
			for (Field<?> field : fields) {
				field.setFormToDb(validation, record);
			}
		}
		return validation.build();
	}

	@Override
	public String toString() {
		return "Crud<" + table.getName() + ">";
	}

	public static <R extends UpdatableRecord<R>> void hook(Router router, String route, Crud<R> crud, Throwing.BiFunction<Request, RockerRaw, CustomRockerModel> render) {
		hook(router, crud, route, (req, validation) -> {
			return render.apply(req, crud.form(req, validation));
		});
	}

	@SafeVarargs
	public static void hookMultiple(Router router, String route, Throwing.BiFunction<Request, Validations, CustomRockerModel> render, List<PostForm<?>> forms, Crud<?>... cruds) {
		List<PostForm<?>> sumForms = new ArrayList<>(forms.size() + cruds.length);
		sumForms.addAll(forms);
		sumForms.addAll(Arrays.asList(cruds));
		MultiFormGetPost multiRoute = new MultiFormGetPost(render, sumForms);
		router.get(route, multiRoute::get);
		router.post(route, multiRoute::post);
	}
}
