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
package common;

import com.fizzed.rocker.RockerModel;
import com.google.common.base.Preconditions;
import forms.api.RockerRaw;
import java.util.Iterator;
import java.util.Locale;
import org.jooby.rocker.RequestRockerTemplate;

public abstract class CustomRockerTemplate extends RequestRockerTemplate {
	public CustomRockerTemplate(RockerModel model) {
		super(model);
	}

	/** Returns the single or plural stream as appropriate, based on the size of the iterable. */
	public String singlePlural(String single, String plural, Iterable<?> iterable) {
		Iterator<?> iter = iterable.iterator();
		if (!iter.hasNext()) {
			return plural;
		} else {
			iter.next();
			if (!iter.hasNext()) {
				return single;
			} else {
				return plural;
			}
		}
	}

	/** Returns link tags for the css files with the given fileset. */
	public RockerRaw style(String fileset) {
		String linkTags = (String) locals.get(fileset + CustomAssets._STYLES);
		Preconditions.checkNotNull(linkTags, "No such styles %s, available: %s", fileset, locals.keySet());
		return new RockerRaw().appendRaw(linkTags);
	}

	/** Returns script tags for the js files with the given fileset. */
	public RockerRaw script(String fileset) {
		String scriptTags = (String) locals.get(fileset + CustomAssets._SCRIPTS);
		Preconditions.checkNotNull(scriptTags, "No such scripts %s, available: %s", fileset, locals.keySet());
		return new RockerRaw().appendRaw(scriptTags);
	}

	/** Returns the single or plural stream as appropriate, based on the count. */
	public static String capitalize(String input) {
		if (input.isEmpty()) {
			return input;
		} else {
			return input.substring(0, 1).toUpperCase(Locale.ROOT) + input.substring(1);
		}
	}
}
