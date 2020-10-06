/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
package org.mytake.factset.video;


import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java2ts.FT;

public class VideoFactContentJava extends FT.VideoFactMeta {
	public String plainText;
	public int[] wordChar;
	public double[] wordTime;
	public int[] turnSpeaker;
	public int[] turnWord;

	/** Encode the arrays into a byte array. */
	public FT.VideoFactContentEncoded toEncoded() {
		FT.VideoFactContentEncoded encoded = new FT.VideoFactContentEncoded();
		encoded.fact = fact;
		encoded.durationSeconds = durationSeconds;
		encoded.youtubeId = youtubeId;
		encoded.speakers = speakers;
		encoded.location = location;
		encoded.notes = notes;
		encoded.plainText = plainText;
		encoded.totalWords = wordChar.length;
		encoded.totalTurns = turnSpeaker.length;

		int totalWords = wordChar.length;
		int totalTurns = turnSpeaker.length;

		int size = 8 * totalWords + 8 * totalTurns;
		ByteBuffer buffer = ByteBuffer.allocate(size);
		buffer.order(ENDIAN);
		buffer.position(buffer.asIntBuffer().put(wordChar).position() * 4);
		buffer.position(buffer.position() + buffer.asFloatBuffer().put(d2f(wordTime)).position() * 4);
		buffer.position(buffer.position() + buffer.asIntBuffer().put(turnSpeaker).put(turnWord).position() * 4);

		byte[] bytes = new byte[buffer.capacity()];
		buffer.flip();
		buffer.get(bytes);
		encoded.data = Base64.getEncoder().encodeToString(bytes);

		return encoded;
	}

	private static float[] d2f(double[] doubles) {
		float[] floats = new float[doubles.length];
		for (int i = 0; i < doubles.length; ++i) {
			floats[i] = (float) doubles[i];
		}
		return floats;
	}

	private static double[] f2d(float[] floats) {
		double[] doubles = new double[floats.length];
		for (int i = 0; i < floats.length; ++i) {
			doubles[i] = (double) floats[i];
		}
		return doubles;
	}

	public static VideoFactContentJava decode(FT.VideoFactContentEncoded encoded) {
		VideoFactContentJava java = new VideoFactContentJava();
		// do the direct transfers
		java.fact = encoded.fact;
		java.youtubeId = encoded.youtubeId;
		java.durationSeconds = encoded.durationSeconds.intValue();
		java.speakers = encoded.speakers;
		java.location = encoded.location;
		java.notes = encoded.notes;
		java.plainText = encoded.plainText;
		// create the new arrays
		java.wordChar = new int[encoded.totalWords];
		float[] wordTime = new float[encoded.totalWords];
		java.turnSpeaker = new int[encoded.totalTurns];
		java.turnWord = new int[encoded.totalTurns];
		// decode into these arrays
		byte[] data = Base64.getDecoder().decode(encoded.data);
		ByteBuffer buffer = ByteBuffer.wrap(data);
		buffer.order(ENDIAN);
		buffer.position(buffer.asIntBuffer().get(java.wordChar).position() * 4);
		buffer.position(buffer.position() + buffer.asFloatBuffer().get(wordTime).position() * 4);
		buffer.asIntBuffer().get(java.turnSpeaker).get(java.turnWord);
		// float to double
		java.wordTime = f2d(wordTime);
		return java;
	}

	private static final ByteOrder ENDIAN = ByteOrder.LITTLE_ENDIAN;
}
