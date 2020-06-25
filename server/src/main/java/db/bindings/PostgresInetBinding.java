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
package db.bindings;

import java.sql.SQLException;
import java.sql.SQLFeatureNotSupportedException;
import java.sql.Types;
import java.util.Objects;
import org.jooq.Binding;
import org.jooq.BindingGetResultSetContext;
import org.jooq.BindingGetSQLInputContext;
import org.jooq.BindingGetStatementContext;
import org.jooq.BindingRegisterContext;
import org.jooq.BindingSQLContext;
import org.jooq.BindingSetSQLOutputContext;
import org.jooq.BindingSetStatementContext;
import org.jooq.Converter;
import org.jooq.impl.DSL;

public class PostgresInetBinding implements Binding<Object, String> {
	private static final long serialVersionUID = 1L;

	@Override
	public Converter<Object, String> converter() {
		return new Converter<Object, String>() {
			private static final long serialVersionUID = 1L;

			@Override
			public String from(Object databaseObject) {
				return databaseObject == null ? null : databaseObject.toString();
			}

			@Override
			public Object to(String userObject) {
				return userObject;
			}

			@Override
			public Class<Object> fromType() {
				return Object.class;
			}

			@Override
			public Class<String> toType() {
				return String.class;
			}
		};
	}

	@Override
	public void sql(BindingSQLContext<String> ctx) throws SQLException {
		ctx.render().visit(DSL.val(ctx.convert(converter()).value())).sql("::inet");
	}

	@Override
	public void register(BindingRegisterContext<String> ctx) throws SQLException {
		ctx.statement().registerOutParameter(ctx.index(), Types.VARCHAR);
	}

	@Override
	public void set(BindingSetStatementContext<String> ctx) throws SQLException {
		ctx.statement().setString(ctx.index(), Objects.toString(ctx.convert(converter()).value(), null));
	}

	@Override
	public void set(BindingSetSQLOutputContext<String> ctx) throws SQLException {
		throw new SQLFeatureNotSupportedException();
	}

	@Override
	public void get(BindingGetResultSetContext<String> ctx) throws SQLException {
		ctx.convert(converter()).value(ctx.resultSet().getString(ctx.index()));
	}

	@Override
	public void get(BindingGetStatementContext<String> ctx) throws SQLException {
		ctx.convert(converter()).value(ctx.statement().getString(ctx.index()));
	}

	@Override
	public void get(BindingGetSQLInputContext<String> ctx) throws SQLException {
		throw new SQLFeatureNotSupportedException();
	}
}
