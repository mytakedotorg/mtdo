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
package common;

import com.diffplug.common.base.Throwing;
import org.jooby.Request;
import org.jooq.DSLContext;
import org.jooq.SelectConditionStep;
import org.jooq.TableField;
import org.jooq.TableRecord;

public class DbMisc {
	public static <T> T transactionFunc(Request req, Throwing.Function<DSLContext, T> transaction) {
		try (DSLContext dslOuter = req.require(DSLContext.class)) {
			return dslOuter.transactionResult(conf -> {
				return transaction.apply(conf.dsl());
			});
		}
	}

	public static void transaction(Request req, Throwing.Consumer<DSLContext> transaction) {
		try (DSLContext dslOuter = req.require(DSLContext.class)) {
			dslOuter.transaction(conf -> {
				transaction.accept(conf.dsl());
			});
		}
	}

	public static <K, R extends TableRecord<R>> R fetchOne(DSLContext dsl, TableField<R, K> keyField, K key) {
		return dsl.selectFrom(keyField.getTable()).where(keyField.eq(key)).fetchOne();
	}

	public static <K, R extends TableRecord<R>, V> V fetchOne(DSLContext dsl, TableField<R, K> keyField, K key, TableField<R, V> valueField) {
		return dsl.selectFrom(keyField.getTable()).where(keyField.eq(key)).fetchOne(valueField);
	}

	public static <K, R extends TableRecord<R>> SelectConditionStep<R> selectWhere(DSLContext dsl, TableField<R, K> keyField, K key) {
		return dsl.selectFrom(keyField.getTable()).where(keyField.eq(key));
	}

}
