/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.fizzed.rocker.RockerModel;
import com.google.common.base.Preconditions;
import forms.api.RockerRaw;
import java.util.Iterator;
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
}
