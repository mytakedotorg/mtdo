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

import com.diffplug.common.base.Preconditions;
import java.security.SecureRandom;
import java.sql.Timestamp;
import javax.annotation.Nullable;
import org.jooby.Env;
import org.jooby.Request;
import org.jooby.Route;
import org.jooq.DSLContext;
import org.jooq.TableField;
import org.jooq.impl.UpdatableRecordImpl;

/** Standard format for stuff that creates random codes for user actions. */
public class UrlRandomCode<T extends UpdatableRecordImpl<T>> {
	private static final int CODE_LENGTH = 44;

	public static final String IP_ANY = "0.0.0.0";
	private static final String PARAM = "code";

	private final String baseUrl;
	private final TableField<T, String> code;
	private final TableField<T, Timestamp> createdAt;
	private final TableField<T, String> requestorIp;
	private final TableField<T, Long> userId;

	public UrlRandomCode(String baseUrl, TableField<T, String> code, TableField<T, Timestamp> createdAt, TableField<T, String> requestorIp, TableField<T, Long> userId) {
		Preconditions.checkArgument(baseUrl.startsWith("/"));
		Preconditions.checkArgument(baseUrl.endsWith("/"));
		this.baseUrl = baseUrl;
		this.code = code;
		this.createdAt = createdAt;
		this.requestorIp = requestorIp;
		this.userId = userId;
	}

	public T createRecord(Request req, DSLContext dsl, Timestamp now, String requestorIp, long userId) {
		String code = RandomString.get(req.require(SecureRandom.class), CODE_LENGTH);
		T record = dsl.newRecord(this.code.getTable());
		record.set(this.code, code);
		record.set(this.createdAt, now);
		record.set(this.requestorIp, requestorIp);
		record.set(this.userId, userId);
		return record;
	}

	public UrlEncodedPath recordToUrl(Request req, T record) {
		return UrlEncodedPath.absolutePath(req, baseUrl + record.get(code));
	}

	public void get(Env env, Route.OneArgHandler handler) {
		env.router().get(baseUrl + ":" + PARAM, handler);
	}

	public void get(Env env, Route.Handler handler) {
		env.router().get(baseUrl + ":" + PARAM, handler);
	}

	public void getPost(Env env, Route.OneArgHandler handler) {
		env.router().get(baseUrl + ":" + PARAM, handler);
		env.router().post(baseUrl + ":" + PARAM, handler);
	}

	public void getPost(Env env, Route.Handler handler) {
		env.router().get(baseUrl + ":" + PARAM, handler);
		env.router().post(baseUrl + ":" + PARAM, handler);
	}

	@Nullable
	public T tryGetRecord(Request req, DSLContext dsl) {
		String code = req.param(PARAM).value("");
		if (code.length() != CODE_LENGTH) {
			return null;
		} else {
			return DbMisc.fetchOne(dsl, this.code, code);
		}
	}
}
