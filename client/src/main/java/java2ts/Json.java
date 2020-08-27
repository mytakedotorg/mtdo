/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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

import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.TypeLiteral;
import java.util.ArrayList;
import java.util.List;

/** Marker interface so JsoniterModule can know that an object is Json. */
@jsweet.lang.Interface
public interface Json {
	@jsweet.lang.Erased
	default String toJson() {
		return JsonStream.serialize(this);
	}

	@jsweet.lang.Erased
	public static class JsonList<T> extends ArrayList<T> implements Json {
		private static final long serialVersionUID = 2713357272578032990L;

		public final TypeLiteral<List<T>> literal;

		public JsonList(TypeLiteral<List<T>> literal) {
			this.literal = literal;
		}

		public JsonList(TypeLiteral<List<T>> literal, int capacity) {
			super(capacity);
			this.literal = literal;
		}
	}
}
