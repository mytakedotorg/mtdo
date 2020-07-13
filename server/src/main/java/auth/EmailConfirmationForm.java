/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
package auth;

import static auth.AuthModule.REDIRECT;

import common.IpGetter;
import common.Time;
import common.UrlEncodedPath;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import java.sql.Timestamp;
import java.util.function.Function;
import javax.annotation.Nullable;
import org.jooby.Request;

class EmailConfirmationForm {
	static UrlEncodedPath generateLink(Request req, MetaFormValidation validation, String path) {
		UrlEncodedPath url = UrlEncodedPath.absolutePath(req, path);
		String redirect = validation.parsed(REDIRECT);
		if (!redirect.isEmpty()) {
			url.param(REDIRECT, redirect);
		}
		return url;
	}

	/** Returns null if there's a validation error. */
	@Nullable
	static <T> MetaFormValidation nullIfValid(Class<? extends MetaFormDef> formClazz, Request req, T link, Function<T, Timestamp> expiresAt, Function<T, String> requestorIp) {
		MetaFormValidation validation = MetaFormValidation.empty(formClazz)
				.initAllIfPresent(req);
		Time time = req.require(Time.class);
		IpGetter ipGetter = req.require(IpGetter.class);
		if (link == null || time.nowTimestamp().after(expiresAt.apply(link))) {
			validation.errorForForm("This link expired");
			return validation;
		} else if (!ipGetter.ip(req).equals(requestorIp.apply(link))) {
			validation.errorForForm("Make sure to open the link from the same computer you requested it from");
			return validation;
		} else {
			return null;
		}
	}
}
