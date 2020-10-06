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
package org.mytake.factset.gradle;


import com.diffplug.gradle.spotless.FormatExtension;

class SpotlessTranscriptPunctuation {
	static void saidAndVtt(FormatExtension fmt) {
		// spotless:off
		fmt.replace("Ellipsis worse than dash",           "...", "-");
		fmt.replace("Unicode ellipsis worse than dash",   "…", "-");
		fmt.replace("No need for em-dash",                "—", "-");
		fmt.replace("No need for double-space",           "  ", " ");
		fmt.replace("Always use simple left apostrophe",  "‘", "'");
		fmt.replace("Always use simple right apostrophe", "’", "'");
		fmt.replace("Always use simple right quote",      "”", "\"");
		fmt.replace("Always use simple left quote",       "“", "\"");
		// spotless:on
	}

	static void saidOnly(FormatExtension fmt) {
		fmt.replace("No need for double dash", "--", "-");
	}
}
