/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

import com.jsoniter.spi.TypeLiteral;
import com.jsoniter.static_codegen.StaticCodegenConfig;

@jsweet.lang.Erased
public class CodegenConfig implements StaticCodegenConfig {
	@Override
	public void setup() {
		// calls to JsoniterSpi
	}

	@SuppressWarnings("rawtypes")
	@Override
	public TypeLiteral[] whatToCodegen() {
		return new TypeLiteral[]{
				new TypeLiteral<DraftRev>() {},
				new TypeLiteral<DraftPost>() {},
				new TypeLiteral<PublishResult>() {}
		};
	}
}
