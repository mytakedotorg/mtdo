/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

@jsweet.lang.Interface
public class DocumentBlock {
	public StringTypes.document kind;
	public String excerptId;
	public jsweet.util.tuple.Tuple2<Integer, Integer> highlightedRange;
	public jsweet.util.tuple.Tuple2<Integer, Integer> viewRange;
}
