/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package compat.java2ts;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java.util.List;
import java2ts.FT.FactContent;
import java2ts.FT.Speaker;
import java2ts.FT.VideoFactContentEncoded;

public class VideoFactContentJava extends FactContent {
	public String youtubeId;
	public double durationSeconds;
	public List<Speaker> speakers;
	public String plainText;
	public int[] charOffsets;
	public double[] timestamps;
	public int[] speakerPerson;
	public int[] speakerWord;

	/** Encode the arrays into a byte array. */
	public VideoFactContentEncoded toEncoded() {
		VideoFactContentEncoded encoded = new VideoFactContentEncoded();
		encoded.fact = fact;
		encoded.durationSeconds = durationSeconds;
		encoded.youtubeId = youtubeId;
		encoded.speakers = speakers;
		encoded.plainText = plainText;
		encoded.numWords = charOffsets.length;
		encoded.numSpeakerSections = speakerPerson.length;

		int numWords = charOffsets.length;
		int numSpeakerSections = speakerPerson.length;

		int size = 8 * numWords + 8 * numSpeakerSections;
		ByteBuffer buffer = ByteBuffer.allocate(size);
		buffer.order(ENDIAN);
		buffer.position(buffer.asIntBuffer().put(charOffsets).position() * 4);
		buffer.position(buffer.position() + buffer.asFloatBuffer().put(d2f(timestamps)).position() * 4);
		buffer.position(buffer.position() + buffer.asIntBuffer().put(speakerPerson).put(speakerWord).position() * 4);

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

	public static VideoFactContentJava decode(VideoFactContentEncoded encoded) {
		VideoFactContentJava java = new VideoFactContentJava();
		// do the direct transfers
		java.fact = encoded.fact;
		java.youtubeId = encoded.youtubeId;
		java.durationSeconds = encoded.durationSeconds.intValue();
		java.speakers = encoded.speakers;
		java.plainText = encoded.plainText;
		// create the new arrays
		java.charOffsets = new int[encoded.numWords];
		float[] timestamps = new float[encoded.numWords];
		java.speakerPerson = new int[encoded.numSpeakerSections];
		java.speakerWord = new int[encoded.numSpeakerSections];
		// decode into these arrays
		byte[] data = Base64.getDecoder().decode(encoded.data);
		ByteBuffer buffer = ByteBuffer.wrap(data);
		buffer.order(ENDIAN);
		buffer.position(buffer.asIntBuffer().get(java.charOffsets).position() * 4);
		buffer.position(buffer.position() + buffer.asFloatBuffer().get(timestamps).position() * 4);
		buffer.asIntBuffer().get(java.speakerPerson).get(java.speakerWord);
		// float to double
		java.timestamps = f2d(timestamps);
		return java;
	}

	private static final ByteOrder ENDIAN = ByteOrder.LITTLE_ENDIAN;
}
