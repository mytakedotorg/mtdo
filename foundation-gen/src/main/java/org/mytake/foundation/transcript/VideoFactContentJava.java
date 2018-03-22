/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java.util.List;
import java2ts.Foundation.FactContent;
import java2ts.Foundation.Person;

public class VideoFactContentJava extends FactContent {
	public String youtubeId;
	public double durationSecs;
	public List<Person> speakers;
	public String plainText;
	public int[] charOffsets;
	public double[] timestamps;
	public int[] speakerPerson;
	public int[] speakerWord;

	public String arraysToBase64() {
		int numWords = charOffsets.length;
		int numSpeakerSections = speakerPerson.length;

		int size = 8 * numWords + 8 * numSpeakerSections;
		ByteBuffer buffer = ByteBuffer.allocate(size);
		buffer.order(ByteOrder.LITTLE_ENDIAN);
		putAll(buffer, charOffsets);
		putAll(buffer, timestamps);
		putAll(buffer, speakerPerson);
		putAll(buffer, speakerWord);

		byte[] bytes = new byte[buffer.capacity()];
		buffer.flip();
		buffer.get(bytes);
		return Base64.getEncoder().encodeToString(bytes);
	}

	static void putAll(ByteBuffer buffer, int[] array) {
		for (int value : array) {
			buffer.putInt(value);
		}
	}

	static void putAll(ByteBuffer buffer, double[] array) {
		for (double valueDouble : array) {
			float value = (float) valueDouble;
			buffer.putFloat(value);
		}
	}
}
