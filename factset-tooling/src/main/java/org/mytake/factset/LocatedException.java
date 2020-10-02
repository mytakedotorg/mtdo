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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset;


import com.diffplug.common.base.Preconditions;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.Nullable;

public class LocatedException extends RuntimeException {
	private static final long serialVersionUID = -275116929627441350L;

	public static Builder atLine(int line) {
		return new Builder(line);
	}

	public static class Builder {
		final int line;
		int colStart = -1;
		int colEnd = -1;
		Path file;

		private Builder(int line) {
			this.line = line;
		}

		public Builder colRange(int colStart, int colEnd) {
			Preconditions.checkArgument(colStart >= 0);
			Preconditions.checkArgument(colEnd >= colStart);
			this.colStart = colStart;
			this.colEnd = colEnd;
			return this;
		}

		public Builder file(Path file) {
			this.file = file;
			return this;
		}

		public LocatedException message(String message) {
			return message(message, null);
		}

		public LocatedException message(Throwable cause) {
			return message(cause.getMessage(), cause);
		}

		public LocatedException message(String message, Throwable cause) {
			return new LocatedException(message, cause, this);
		}
	}

	public final @Nullable Path file;
	public final Loc loc;

	LocatedException(String message, Throwable cause, Builder builder) {
		super(message, cause);
		if (builder.colStart == -1) {
			Matcher matcher = Pattern.compile("(\\d+),(\\d+):").matcher(message);
			if (matcher.find()) {
				loc = new Loc(builder.line, Integer.parseInt(matcher.group(1)), Integer.parseInt(matcher.group(2)));
			} else {
				loc = new Loc(builder.line);
			}
		} else {
			loc = new Loc(builder.line, builder.colStart, builder.colEnd);
		}
		file = builder.file;
	}
}
