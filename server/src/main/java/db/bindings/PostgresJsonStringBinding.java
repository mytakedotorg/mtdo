/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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

// We're binding <T> = Object (unknown JDBC type), and <U> = JsonElement (user type)
public class PostgresJsonStringBinding implements Binding<Object, String> {
	private static final long serialVersionUID = 1L;

	@Override
	public Converter<Object, String> converter() {
		return new Converter<Object, String>() {
			private static final long serialVersionUID = 1L;

			@Override
			public String from(Object t) {
				return (String) t;
			}

			@Override
			public String to(String u) {
				return u;
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

	// Rending a bind variable for the binding context's value and casting it to the json type
	@Override
	public void sql(BindingSQLContext<String> ctx) throws SQLException {
		// Depending on how you generate your SQL, you may need to explicitly distinguish
		// between jOOQ generating bind variables or inlined literals. If so, use this check:
		// ctx.render().paramType() == INLINED
		ctx.render().visit(DSL.val(ctx.convert(converter()).value())).sql("::json");
	}

	// Registering VARCHAR types for JDBC CallableStatement OUT parameters
	@Override
	public void register(BindingRegisterContext<String> ctx) throws SQLException {
		ctx.statement().registerOutParameter(ctx.index(), Types.VARCHAR);
	}

	// Converting the String to a String value and setting that on a JDBC PreparedStatement
	@Override
	public void set(BindingSetStatementContext<String> ctx) throws SQLException {
		ctx.statement().setString(ctx.index(), Objects.toString(ctx.convert(converter()).value(), null));
	}

	// Getting a String value from a JDBC ResultSet and converting that to a String
	@Override
	public void get(BindingGetResultSetContext<String> ctx) throws SQLException {
		ctx.convert(converter()).value(ctx.resultSet().getString(ctx.index()));
	}

	// Getting a String value from a JDBC CallableStatement and converting that to a String
	@Override
	public void get(BindingGetStatementContext<String> ctx) throws SQLException {
		ctx.convert(converter()).value(ctx.statement().getString(ctx.index()));
	}

	// Setting a value on a JDBC SQLOutput (useful for Oracle OBJECT types)
	@Override
	public void set(BindingSetSQLOutputContext<String> ctx) throws SQLException {
		throw new SQLFeatureNotSupportedException();
	}

	// Getting a value from a JDBC SQLInput (useful for Oracle OBJECT types)
	@Override
	public void get(BindingGetSQLInputContext<String> ctx) throws SQLException {
		throw new SQLFeatureNotSupportedException();
	}
}
