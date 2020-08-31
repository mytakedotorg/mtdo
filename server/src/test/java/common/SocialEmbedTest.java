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
 * You can contact us at team@mytake.org
 */
package common;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import views.SocialEmbed.socialImage;

public class SocialEmbedTest {
	public static void main(String[] args) throws IOException {
		String toSave = socialImage.template().renderTest()
				.replace("\"/assets-dev/", "\"./assets-dev/");
		Path file = Paths.get(args[0]);
		Files.createDirectories(file.getParent());
		Files.write(file, toSave.getBytes(StandardCharsets.UTF_8));
	}
}
