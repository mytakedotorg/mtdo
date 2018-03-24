/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Unhandled;

public enum SaidVtt {
	SAID, VTT;

	public <T> T saidVtt(T said, T vtt) {
		switch (this) {
		case SAID:
			return said;
		case VTT:
			return vtt;
		default:
			throw Unhandled.enumException(this);
		}
	}
}
