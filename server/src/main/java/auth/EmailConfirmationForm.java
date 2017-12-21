/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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

	@Nullable
	static <T> MetaFormValidation validate(Class<? extends MetaFormDef> formClazz, Request req, T link, Function<T, Timestamp> expiresAt, Function<T, String> requestorIp) {
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
