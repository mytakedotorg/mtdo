/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import java.io.IOException;
import org.junit.Ignore;
import org.junit.Test;

public class OurV8Test {
	/**
	 * If you uncomment the @Ignore, you will find that it fails with:
	 * 
	 * undefined:1060: ReferenceError: document is not defined
	 * var canvas = document.createElement("canvas");
	 *              ^
	 *              ReferenceError: document is not defined
	 *              at Object.drawCaption (<anonymous>:1060:18)
	 *              at Object.drawVideoFact (<anonymous>:111:34)
	 */
	@Ignore
	@Test
	public void test() throws IOException {
		// https://mytake-staging-pr-200.herokuapp.com/anonymous/word/v1/eyJ0aXRsZSI6IldvcmQuIiwidmlkSWQiOiJFZ3VNaGl0SjhxQmRENjNsRWNQbmVwa2VhZGM4d0xlT2EyUjQ2eVhVdUFVPSIsImhTdGFydCI6Ijg3LjQ5MCIsImhFbmQiOiI5NS43NTAiLCJ2U3RhcnQiOiI4Ni42NjQiLCJ2RW5kIjoiOTYuNTc2In0=
		String vidId = "EguMhitJ8qBdD63lEcPnepkeadc8wLeOa2R46yXUuAU=";
		double start = 87.490;
		double end = 95.750;
		try (OurV8 ourV8 = new OurV8()) {
			String dataURI = ourV8.drawVideoFact(vidId, start, end);
			System.out.println("dataURI=" + dataURI);
		}
	}
}
