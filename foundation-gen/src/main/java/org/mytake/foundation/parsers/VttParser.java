/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.parsers;

import java.util.ArrayList;
import java.util.List;
import java2ts.Foundation.CaptionWord;

public class VttParser {
	static double convertTimestampToSeconds(String timestamp) {
		String[] pieces = timestamp.split(":");
		// parse data string in form HH:MM:SS.SSS
		int HH = Integer.parseInt(pieces[0]);
		int MM = Integer.parseInt(pieces[1]);
		double SS = Double.parseDouble(pieces[2]);
		// convert HHMMSS to seconds
		return HH * 60 * 60 + MM * 60 + SS;
	}

	public static List<CaptionWord> parse(String source) {
		String[] sourceArr = source.split("\n\n");
		List<CaptionWord> wordTimeMaps = new ArrayList<>();
		int idx = 0;
		String word = null;
		for (int i = 1; i < sourceArr.length; ++i) {
			String block = sourceArr[i];
			String[] lines = block.split("\n");
			for (String line : lines) {
				if (line.indexOf("-->") != -1) {
					// found an arrow, don't parse this line
					if (word != null) {
						word = word.trim(); // trim all whitespace
						if (word.split(" ").length > 1) {
							throw new IllegalArgumentException("Encountered word with a space in it. Index: " + idx + ", word: " + word);
						}
						word += " "; // append a single space
						CaptionWord captionWord = new CaptionWord();
						captionWord.idx = idx;
						captionWord.word = word;
						captionWord.timestamp = convertTimestampToSeconds(line.split(" ")[0]);
						wordTimeMaps.add(captionWord);
						++idx;
					}
					continue;
				}
				boolean isWord = true;
				boolean isTimestamp = false;
				word = "";
				String timestamp = "";

				for (char c : line.toCharArray()) {
					if (c == '<') {
						isWord = false;
						isTimestamp = true;
					}
					if (isWord) {
						word += c;
						continue;
					} else if (isTimestamp) {
						if (c == 'c') {
							// ran into a break character
							// this isn't a timestamp so clear timestamp variable
							timestamp = "";
							// set isTimestamp to false until < character is found
							isTimestamp = false;
							continue;
						} else if (c == '>') {
							// reached end of timestamp, push into map
							word = word.trim(); //Trim all whitespace
							if (word.split(" ").length > 1) {
								throw new IllegalArgumentException("Encountered word with a space in it. Index: " +
										idx +
										", word: " +
										word);
							}
							word += " "; //Append a single space
							CaptionWord captionWord = new CaptionWord();
							captionWord.idx = idx;
							captionWord.word = word;
							captionWord.timestamp = convertTimestampToSeconds(timestamp);
							wordTimeMaps.add(captionWord);
							// reinitialize all variables
							isWord = true;
							isTimestamp = false;
							word = "";
							timestamp = "";
							idx++;
							continue;
						} else if (c != '<') {
							timestamp += c;
							continue;
						}
					} else if (c == '>') {
						isWord = true;
						isTimestamp = false;
						continue;
					}
				}
			}
		}
		return wordTimeMaps;
	}
}
