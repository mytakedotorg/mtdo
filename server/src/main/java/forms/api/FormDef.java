/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package forms.api;

import java.util.Set;

/** The contract that all forms must meet. */
public interface FormDef {
	/** Returns the field names for the given form. */
	Set<String> fieldNames();

}
