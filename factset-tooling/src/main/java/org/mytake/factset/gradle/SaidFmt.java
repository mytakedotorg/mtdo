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
package org.mytake.factset.gradle;


import com.diffplug.gradle.spotless.FormatExtension;

class SaidFmt {
	static void saidAndVtt(FormatExtension fmt) {
		fmt.replace("Acronyms confuse our tooling 1", "F.B.I.", "FBI");
		fmt.replace("Acronyms confuse our tooling 2", "G.N.P.", "GNP");
		fmt.replace("Acronyms confuse our tooling 3", "D.C.", "DC");
		fmt.replace("Acronyms confuse our tooling 4", "A.M.", "AM");
		fmt.replace("Acronyms confuse our tooling 5", "P.M.", "PM");
		fmt.replace("Acronyms confuse our tooling 6", "A. M.", "AM");
		fmt.replace("Acronyms confuse our tooling 7", "P. M.", "PM");
		fmt.replace("Ellipsis worse than dash", "...", "-");
		fmt.replace("Unicode ellipsis worse than dash", "…", "-");
		fmt.replace("No need for em-dash", "—", "-");
		fmt.replace("No need for double-space", "  ", " ");
		fmt.replace("Percent is a word", " per cent", " percent");
		fmt.replace("Adviser is canonical", "advisor", "adviser");    // http://grammarist.com/spelling/adviser-advisor/
		fmt.replace("Always use simple left apostrophe", "‘", "'");
		fmt.replace("Always use simple right apostrophe", "’", "'");
		fmt.replace("Always use simple right quote", "”", "\"");
		fmt.replace("Always use simple left quote", "“", "\"");
		fmt.replace("No need for sound effects 1", "[Applause]", "");
		fmt.replace("No need for sound effects 2", "(Applause)", "");
		fmt.replace("No need for sound effects 3", "[applause]", "");
		fmt.replace("No need for sound effects 4", "(applause)", "");
		fmt.replace("No need for sound effects 5", "[Laughter]", "");
		fmt.replace("No need for sound effects 6", "(Laughter)", "");
		fmt.replace("No need for sound effects 7", "[laughter]", "");
		fmt.replace("No need for sound effects 8", "(laughter)", "");
		fmt.replace("No need for sound effects 9", "(ph)", "");
		fmt.replace("No need for sound effects 10", "(phonetic)", "");
		fmt.replace("Use the number 1 instead of the letter l", "l9", "19");
		fmt.replace("trickle-down canonical", "trickle down", "trickle-down"); // https://en.wikipedia.org/wiki/Trickle-down_economics
		fmt.replace("AP stylebook says health care 1", "healthcare", "health care"); // https://www.esolutionsinc.com/resources/healthcare-technology/how-in-the-health-care-do-you-spell-healthcare/#:~:text=In%20the%20health%20care%20versus,AP%20deems%20it%20two%20words.&text=Therefore%2C%20news%20organizations%20across%20the,two%2Dword%20form%20without%20question.
		fmt.replace("AP stylebook says health care 2", "health-care", "health care"); // https://www.esolutionsinc.com/resources/healthcare-technology/how-in-the-health-care-do-you-spell-healthcare/#:~:text=In%20the%20health%20care%20versus,AP%20deems%20it%20two%20words.&text=Therefore%2C%20news%20organizations%20across%20the,two%2Dword%20form%20without%20question.
		fmt.replace("AP stylebook says health care 3", "Healthcare", "Health care"); // https://www.esolutionsinc.com/resources/healthcare-technology/how-in-the-health-care-do-you-spell-healthcare/#:~:text=In%20the%20health%20care%20versus,AP%20deems%20it%20two%20words.&text=Therefore%2C%20news%20organizations%20across%20the,two%2Dword%20form%20without%20question.
		fmt.replace("AP stylebook says health care 4", "Health-care", "Health care"); // https://www.esolutionsinc.com/resources/healthcare-technology/how-in-the-health-care-do-you-spell-healthcare/#:~:text=In%20the%20health%20care%20versus,AP%20deems%20it%20two%20words.&text=Therefore%2C%20news%20organizations%20across%20the,two%2Dword%20form%20without%20question.
	}

	static void saidOnly(FormatExtension fmt) {
		fmt.replace("No need for double dash", "--", "-");
	}
}
