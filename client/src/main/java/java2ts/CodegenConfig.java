/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.TypeLiteral;
import com.jsoniter.static_codegen.StaticCodegenConfig;

@jsweet.lang.Erased
public class CodegenConfig implements StaticCodegenConfig {
	@Override
	public void setup() {
		JsonIterator.setMode(DecodingMode.STATIC_MODE);
		JsonStream.setMode(EncodingMode.STATIC_MODE);
	}

	@SuppressWarnings("rawtypes")
	@Override
	public TypeLiteral[] whatToCodegen() {
		return new TypeLiteral[]{
				TypeLiteral.create(DraftRev.class),
				TypeLiteral.create(DraftPost.class),
				TypeLiteral.create(PublishResult.class),
				TypeLiteral.create(LoginCookie.class),
				TypeLiteral.create(TakeReactionJson.UserState.class),
				TypeLiteral.create(TakeReactionJson.TakeState.class),
				TypeLiteral.create(TakeReactionJson.ReactReq.class),
				TypeLiteral.create(TakeReactionJson.ReactRes.class),
				TypeLiteral.create(TakeReactionJson.ViewReq.class),
				TypeLiteral.create(TakeReactionJson.ViewRes.class)
		};
	}

	@Override
	public String toString() {
		return "stable";
	}
}
