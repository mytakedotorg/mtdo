/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2018 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
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
