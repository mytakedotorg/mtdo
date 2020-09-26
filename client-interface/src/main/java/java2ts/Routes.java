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
 * You can contact us at team@mytake.org
 */
package java2ts;

@jsweet.lang.Interface
public class Routes {
	public static final String API = "/api";
	public static final String API_TAKE_VIEW = "/api/takeView";
	public static final String API_TAKE_REACT = "/api/takeReact";
	public static final String API_FOLLOW_ASK = "/api/followAsk";
	public static final String API_FOLLOW_TELL = "/api/followTell";
	public static final String API_IMAGES = "/api/images";
	public static final String API_SEARCH = "/api/search";
	public static final String API_BOOKMARKS = "/api/bookmarks";
	public static final String API_LOGIN = "/api/login";
	public static final String API_FACT = "/api/fact";

	public static final String MODS = "/mods";
	public static final String MODS_DRAFTS = "/mods/drafts/";

	public static final String DRAFTS = "/drafts";
	public static final String DRAFTS_NEW = "/drafts/new";
	public static final String DRAFTS_DELETE = "/drafts/delete";
	public static final String DRAFTS_PUBLISH = "/drafts/publish";
	public static final String DRAFTS_SAVE = "/drafts/save";

	public static final String LOGIN = "/login";
	public static final String LOGOUT = "/logout";
	public static final String USERNAME = "/username";

	public static final String PROFILE_NO_USERNAME = "my";
	public static final String PROFILE_TAB = "tab";
	public static final String PROFILE_TAB_STARS = "stars";
	public static final String PROFILE_TAB_EDIT = "edit";
	public static final String PROFILE_TAB_BOOKMARKS = "bookmarks";
	public static final String PROFILE_TAB_FOLLOWING = "following";
	public static final String PROFILE_TAB_FOLLOWERS = "followers";

	public static final String ANONYMOUS = "/anonymous";
	public static final String SEARCH = "/search";
	public static final String TIMELINE = "/timeline";
	public static final String FOUNDATION = "/foundation";
	public static final String FOUNDATION_DATA = "/foundation-data";
	public static final String FOUNDATION_INDEX_HASH = "/foundation-index-hash.json";

	public static final String ABOUT = "/about";
	public static final String ABOUTUS = "/aboutus";
	public static final String PRIVACY = "/privacy";
	public static final String TERMS = "/terms";
	public static final String TOS = "/tos";
	public static final String FAQ = "/faq";
	public static final String RULES = "/rules";

	public static final String PATH_NODE_SOCIAL_HEADER = "/static/social-header/";
	public static final String PATH_NODE_SOCIAL_IMAGE = "/static/social-image/";
	public static final String PATH_NODE_SOCIAL_IMAGE_TWITTER = "/static/social-image-twitter/";
}
