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
package forms.api;

import com.diffplug.common.base.Unhandled;
import java.util.Set;

/** The contract that all forms must meet. */
public interface FormDef {
	Set<String> fieldNames();

	Method method();

	String actionUrl();

	public enum Method {
		GET, POST;

		void addAttr(RockerRaw openForm) {
			switch (this) {
			case GET:
				openForm.appendAttr("method", "get");
				break;
			case POST:
				openForm.appendAttr("method", "post", "enctype", "application/x-www-form-urlencoded");
				break;
			default:
				throw Unhandled.enumException(this);
			}
		}

		public <T> T getPost(T get, T post) {
			// @formatter:off
			switch (this) {
			case GET:	return get;
			case POST:	return post;
			default:	throw Unhandled.enumException(this);
			}
			// @formatter:on
		}
	}
}
