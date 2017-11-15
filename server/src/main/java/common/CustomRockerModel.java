/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.fizzed.rocker.runtime.DefaultRockerModel;
import com.fizzed.rocker.runtime.StringBuilderOutput;

public abstract class CustomRockerModel extends DefaultRockerModel {
	/** Renders this model to a string. */
	public String renderToString() {
		return render(StringBuilderOutput.FACTORY).toString();
	}
}
