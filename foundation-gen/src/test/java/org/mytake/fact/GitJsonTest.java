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
package org.mytake.fact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.Test;

public class GitJsonTest {
	@Test
	public void shortest() {
		// can't be empty or start with a newline or ⌊
		assertThatThrownBy(() -> GitJson.recondense("")).isInstanceOf(IllegalArgumentException.class);
		assertThatThrownBy(() -> GitJson.recondense("\n")).isInstanceOf(IllegalArgumentException.class);
		assertThatThrownBy(() -> GitJson.recondense("⌊")).isInstanceOf(IllegalArgumentException.class);
		assertThatThrownBy(() -> GitJson.recondense("\n ")).isInstanceOf(IllegalArgumentException.class);
		assertThatThrownBy(() -> GitJson.recondense("⌊")).isInstanceOf(IllegalArgumentException.class);
		// but it can be small, or have the forbidden characters in any other position
		assertThat(GitJson.recondense("⌋")).isEqualTo("⌋");
		assertThat(GitJson.recondense(" ")).isEqualTo(" ");
		assertThat(GitJson.recondense(" \n")).isEqualTo(" ");
		assertThat(GitJson.recondense(" ⌊")).isEqualTo(" ");
		assertThat(GitJson.recondense(" ⌊⌋")).isEqualTo(" ");
	}

	@Test
	public void consecutive() {
		assertThat(GitJson.recondense(" \n\n\n")).isEqualTo(" ");
		assertThat(GitJson.recondense(" \n\n\n ")).isEqualTo("  ");
		assertThat(GitJson.recondense(" ⌊⌋⌊⌋⌊⌋")).isEqualTo(" ");
		assertThat(GitJson.recondense(" ⌊⌋⌊⌋⌊⌋ ")).isEqualTo("  ");
		assertThat(GitJson.recondense(" ⌊⌋\n⌊⌋ ")).isEqualTo("  ");
		assertThat(GitJson.recondense(" \n⌊⌋\n ")).isEqualTo("  ");
	}

	@Test
	public void typical() {
		assertThat(GitJson.recondense("a\nb\n⌊nope⌋\n⌊nada⌋c")).isEqualTo("abc");
	}
}
