/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

@jsweet.lang.Interface
public class Routes {
	public static final String API = "/api";
	public static final String API_TAKE_VIEW = "/api/takeView";
	public static final String API_TAKE_REACT = "/api/takeReact";
	public static final String API_EMAIL_SELF = "/api/emailSelf";
	public static final String API_FOLLOW_ASK = "/api/followAsk";
	public static final String API_FOLLOW_TELL = "/api/followTell";

	public static final String MODS = "/mods";
	public static final String MODS_DRAFTS = "/mods/drafts/";

	public static final String DRAFTS = "/drafts";
	public static final String DRAFTS_NEW = "/drafts/new";
	public static final String DRAFTS_DELETE = "/drafts/delete";
	public static final String DRAFTS_PUBLISH = "/drafts/publish";
	public static final String DRAFTS_SAVE = "/drafts/save";

	public static final String LOGIN = "/login";
	public static final String LOGOUT = "/logout";

	public static final String PROFILE_TAB = "tab";
	public static final String PROFILE_TAB_STARS = "stars";
	public static final String PROFILE_TAB_EDIT = "edit";

	public static final String TIMELINE = "/timeline";
	public static final String FOUNDATION = "/foundation";
	public static final String FOUNDATION_V1 = "/foundation-v1";
	public static final String FOUNDATION_DATA = "/foundation-data";
	public static final String FOUNDATION_INDEX_HASH = "/foundation-index-hash.json";

	public static final String ABOUT = "/about";
	public static final String ABOUTUS = "/aboutus";
	public static final String PRIVACY = "/privacy";
	public static final String TERMS = "/terms";
	public static final String TOS = "/tos";
	public static final String FAQ = "/faq";
	public static final String RULES = "/rules";
}
