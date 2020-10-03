/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset;


import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.StringPrinter;
import java.io.File;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.eclipse.jface.text.IDocument;

@SuppressWarnings("serial")
public abstract class DisallowedValueException extends RuntimeException {
	public final String value;
	public final Set<String> allowed;
	public final File fileWhichSpecifies;

	protected DisallowedValueException(String value, Set<String> allowed, File fileWhichSpecifies) {
		this.value = value;
		this.allowed = allowed;
		this.fileWhichSpecifies = fileWhichSpecifies;
	}

	@Override
	public String getMessage() {
		return StringPrinter.buildString(printer -> {
			printer.println("Unknown " + kind() + " '" + value + "'. Allowed values:");
			for (String a : allowed) {
				printer.println("  " + a);
			}
			printer.println("Change value to one of those, or open '" + fileWhichSpecifies + "' to change the allowed values.");
		});
	}

	public abstract String kind();

	public abstract void replaceValueWithAllowed(String newValue, IDocument doc);

	public static DisallowedValueException peopleInSaid(String speaker, Set<String> allowed, File fileWhichSpecifies) {
		return new DisallowedValueException(speaker, allowed, fileWhichSpecifies) {
			@Override
			public String kind() {
				return "speaker";
			}

			@Override
			public void replaceValueWithAllowed(String newValue, IDocument doc) {
				Preconditions.checkArgument(allowed.contains(newValue));
				Matcher matcher = Pattern.compile("^" + Pattern.quote(value + ": "), Pattern.MULTILINE).matcher(doc.get());
				doc.set(matcher.replaceAll(newValue + ": "));
			}
		};
	}

	public static DisallowedValueException peopleInJson(String speaker, Set<String> allowed, File fileWhichSpecifies) {
		return replaceJsonString(speaker, allowed, fileWhichSpecifies, "speaker");
	}

	public static DisallowedValueException rolesInJson(String role, Set<String> allowed, File fileWhichSpecifies) {
		return replaceJsonString(role, allowed, fileWhichSpecifies, "role");
	}

	private static DisallowedValueException replaceJsonString(String value, Set<String> allowed, File fileWhichSpecifies, String kind) {
		return new DisallowedValueException(value, allowed, fileWhichSpecifies) {
			@Override
			public String kind() {
				return kind;
			}

			@Override
			public void replaceValueWithAllowed(String newValue, IDocument doc) {
				Preconditions.checkArgument(allowed.contains(newValue));
				doc.set(doc.get().replace("\"" + value + "\"", "\"" + newValue + "\""));
			}
		};
	}
}
