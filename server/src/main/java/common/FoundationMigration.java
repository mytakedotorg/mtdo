/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
