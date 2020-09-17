/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2020 MyTake.org, Inc.
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
