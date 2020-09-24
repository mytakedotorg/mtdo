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


import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.assertj.core.api.Assertions;
import org.gradle.internal.impldep.com.google.common.collect.Maps;
import org.junit.Test;
import org.mytake.factset.gradle.MtdoFactset.VideoCfg;
import org.slf4j.Logger;

public class GrindLogicTest extends ResourceHarness {
	@Test
	public void video() throws IOException {
		VideoCfg config = new VideoCfg();
		Logger logger = new org.slf4j.helpers.NOPLoggerFactory().getLogger("noop");
		GrindLogic logic = new GrindLogic(rootFolder().toPath(), config, logger);

		setFile("ingredients/subfolder/doesnt/matter/1960-09-26.json").toResource("org/mytake/factset/gradle/1960-09-26.json");
		setFile("ingredients/subfolder/doesnt/matter/1960-09-26.said").toResource("org/mytake/factset/gradle/1960-09-26.said");
		setFile("ingredients/subfolder/doesnt/matter/1960-09-26.vtt").toResource("org/mytake/factset/gradle/1960-09-26.vtt");
		Map<String, String> buildJson = new HashMap<>();
		logic.grind(Collections.singleton("subfolder/doesnt/matter/1960-09-26"), buildJson);
		Assertions.assertThat(buildJson).containsExactly(Maps.immutableEntry(
				"subfolder/doesnt/matter/1960-09-26", "presidential-debate-kennedy-nixon-1-of-4"));

		assertFile("sausage/presidential-debate-kennedy-nixon-1-of-4.json").sameAsResource("org/mytake/factset/gradle/kennedy-nixon-1-of-4.json");
	}
}
