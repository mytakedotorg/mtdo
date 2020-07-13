/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2017-2018 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation;

import java.nio.file.Path;
import java.nio.file.Paths;

public class Folders {
	public static Path SRC_DOCUMENT = Paths.get("src/main/resources/document");
	public static Path SRC_PRESIDENTIAL_DEBATES = Paths.get("../presidential-debates");
	public static Path DST_FOUNDATION_RESOURCES = Paths.get("../foundation/src/main/resources");
	public static Path DST_FOUNDATION_DATA = DST_FOUNDATION_RESOURCES.resolve("foundation-data");
}
