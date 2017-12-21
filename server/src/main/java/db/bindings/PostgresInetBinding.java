/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
