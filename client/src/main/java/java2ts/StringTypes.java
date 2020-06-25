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
package java2ts;

@jsweet.lang.Erased
public interface StringTypes {
	// ParagraphBlock / DocumentBlock / VideoBlock
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface paragraph {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface document {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface video {}

	// DocumentFact
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface ratified {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface published {}

	// VideoFact
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface recorded {}

}
