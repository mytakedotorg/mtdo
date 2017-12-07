/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

@jsweet.lang.Interface
public class Routes {
	public static final String API = "/api";

	public static final String DRAFTS = "/drafts";
	public static final String DRAFTS_NEW = "/drafts/new";
	public static final String DRAFTS_DELETE = "/drafts/delete";
	public static final String DRAFTS_PUBLISH = "/drafts/publish";
	public static final String DRAFTS_SAVE = "/drafts/save";
	public static final String LOGIN = "/login";
	public static final String LOGOUT = "/logout";

	public static final String FOUNDATION = "/foundation";
	public static final String FOUNDATION_DATA = "/foundation-data";
	public static final String FOUNDATION_DATA_INDEX = "/foundation-data/index.json";
}
