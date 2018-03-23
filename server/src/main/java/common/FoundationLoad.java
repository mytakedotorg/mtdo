/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.google.common.io.ByteSource;
import com.google.common.io.Resources;
import com.jsoniter.JsonIterator;
import com.jsoniter.any.Any;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.JsoniterSpi;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.TimeZone;
import java.util.function.Consumer;
import java2ts.Foundation;
import java2ts.Foundation.FactLink;
import java2ts.Routes;

public class FoundationLoad {
	/** Turns yyyy-MM-dd into milliseconds since Jan 1 1970. */
	public static long parseDate(String yyyyMMdd) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		format.setTimeZone(TimeZone.getTimeZone("UTC"));
		return Errors.rethrow().get(() -> format.parse(yyyyMMdd).getTime());
	}

	static {
		// read all numbers as integer (cuz they're all indices)
		JsoniterSpi.registerTypeDecoder(Number.class, iter -> iter.readInt());
		Config config = JsoniterSpi.getCurrentConfig().copyBuilder()
				.escapeUnicode(false)
				.decodingMode(DecodingMode.REFLECTION_MODE)
				.encodingMode(EncodingMode.REFLECTION_MODE)
				.build();
		JsoniterSpi.setCurrentConfig(config);
	}

	public static void perVideo(Consumer<VideoFactContentJava> perVideo) throws IOException {
		Foundation.IndexPointer pointer = loadJson(Routes.FOUNDATION_INDEX_HASH, Foundation.IndexPointer.class);
		List<Any> factLinks = loadJson(Routes.FOUNDATION_DATA + "/" + pointer.hash + ".json").asList();
		for (Any factLinkAny : factLinks) {
			FactLink factLink = factLinkAny.as(FactLink.class);
			if (factLink.fact.kind.equals(Foundation.KIND_VIDEO)) {
				Foundation.VideoFactContentEncoded encoded = loadJson(Routes.FOUNDATION_DATA + "/" + factLink.hash + ".json", Foundation.VideoFactContentEncoded.class);
				perVideo.accept(VideoFactContentJava.decode(encoded));
			}
		}
	}

	private static <T> T loadJson(String path, Class<T> clazz) throws IOException {
		ByteSource source = Resources.asByteSource(FoundationLoad.class.getResource(path));
		return JsonIterator.deserialize(source.read(), clazz);
	}

	private static Any loadJson(String path) throws IOException {
		ByteSource source = Resources.asByteSource(FoundationLoad.class.getResource(path));
		return JsonIterator.deserialize(source.read());
	}
}
