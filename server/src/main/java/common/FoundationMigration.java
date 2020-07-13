/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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

import com.diffplug.common.base.Errors;
import com.google.common.base.Preconditions;
import com.google.common.io.Resources;
import java.nio.charset.StandardCharsets;
import org.jooq.JSONB;

public abstract class FoundationMigration {
	public abstract String description();

	public JSONB migrate(JSONB input) {
		String data = input.data();
		String result = migrate(data);
		return result == data ? input : JSONB.valueOf(result);
	}

	/**
	 * Given the json content of a `blocks` array, returns the migrated blocks array.
	 */
	public abstract String migrate(String input);

	public static FoundationMigration createReplacing(String replaceResource) {
		return new Replacing(replaceResource);
	}

	private static class Replacing extends FoundationMigration {
		private final String replaceResource;
		private String[] data;

		private Replacing(String replaceResource) {
			this.replaceResource = replaceResource;
		}

		@Override
		public String description() {
			return replaceResource;
		}

		private void init() {
			if (data != null) {
				return;
			}
			String resource = "/foundation/migration/" + replaceResource + ".replace";
			String init = Errors.rethrow().get(() -> Resources.toString(FoundationMigration.class.getResource(resource), StandardCharsets.UTF_8));
			data = init.split("\n");
			Preconditions.checkArgument(data.length % 2 == 0);
		}

		@Override
		public String migrate(String input) {
			init();
			int i = 0;
			while (i < data.length) {
				String orig = data[i];
				int needsReplacement = orig.indexOf(orig);
				if (needsReplacement >= 0) {
					return migrateChanged(input, i);
				}
				i += 2;
			}
			return input;
		}

		private String migrateChanged(String input, int origIdx) {
			StringBuilder builder = new StringBuilder(input);

			while (origIdx < data.length) {
				String orig = data[origIdx++];
				String replacement = data[origIdx++];

				int startFrom = 0;
				int idx;
				while ((idx = builder.indexOf(orig, startFrom)) > startFrom) {
					startFrom = idx + orig.length();
					builder.replace(idx, startFrom, replacement);
				}
			}
			return builder.toString();
		}
	}
}
