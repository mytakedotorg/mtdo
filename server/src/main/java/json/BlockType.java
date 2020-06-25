/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
package json;

import java2ts.DocumentBlock;
import java2ts.ParagraphBlock;
import java2ts.VideoBlock;

public enum BlockType {
	PARAGRAPH(ParagraphBlock.class), VIDEO(VideoBlock.class), DOCUMENT(DocumentBlock.class);

	private final Class<?> blockClazz;

	private BlockType(Class<?> blockClazz) {
		this.blockClazz = blockClazz;
	}

	public static BlockType of(Object obj) {
		for (BlockType type : BlockType.values()) {
			if (type.blockClazz.isInstance(obj)) {
				return type;
			}
		}
		throw new IllegalArgumentException((obj == null ? "null" : obj.getClass()) + " is not a block");
	}
}
