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
package common;

import forms.api.RockerRaw;
import java.util.Objects;

public enum Emails {
	TEAM("team", "Team"), TECH("tech", "Technology Team");

	public static final String ADDRESS_1 = "340 S Lemon Ave #3433";
	public static final String ADDRESS_2 = "Walnut, CA 91789";

	private final String email;
	private final String name;

	Emails(String email, String name) {
		this.email = Objects.requireNonNull(email);
		this.name = Objects.requireNonNull(name);
	}

	@Override
	public String toString() {
		throw new UnsupportedOperationException("You probably want linkEmail() or link(String body)");
	}

	public String email() {
		return email + "@mytake.org";
	}

	public String title() {
		return "The MyTake.org " + name;
	}

	public RockerRaw linkEmail() {
		return link(email());
	}

	public RockerRaw link(String body) {
		return RockerRaw.raw("<a href=\"mailto:" + email() + "\">" + body + "</a>");
	}
}
