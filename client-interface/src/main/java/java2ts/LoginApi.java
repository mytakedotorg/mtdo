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
package java2ts;

public interface LoginApi {
	@jsweet.lang.Interface
	public static class Req implements Json {
		public String email;
		public String kind;
		/** login, use, newsletter */
		@jsweet.lang.Optional
		public String redirect; /** If set, login link will send user to this URL. Should start with `/`, and not include domain. */
	}

	@jsweet.lang.Interface
	public static class Res implements Json {
		public String title;
		public String body;
		public String btn;
	}
}
