/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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

public interface Share {
	/** When someone shares a clip or an excerpt. */
	@jsweet.lang.Interface
	public class ShareReq implements Json {
		public String title;
		public String hStart;
		public String hEnd;
		@jsweet.lang.Optional
		public String docId;
		@jsweet.lang.Optional
		public String vidId;
		@jsweet.lang.Optional
		public String vStart;
		@jsweet.lang.Optional
		public String vEnd;
	}

	@jsweet.lang.Interface
	public class ShareRes implements Json {

	}
}
