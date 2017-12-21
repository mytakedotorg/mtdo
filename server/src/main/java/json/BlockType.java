/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
