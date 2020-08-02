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
				TypeLiteral.create(TakeReactionJson.ViewRes.class),
				TypeLiteral.create(FollowJson.FollowAskReq.class),
				TypeLiteral.create(FollowJson.FollowTellReq.class),
				TypeLiteral.create(FollowJson.FollowRes.class),
				TypeLiteral.create(Search.VideoResult.class),
				TypeLiteral.create(Search.FactResultList.class)
		};
	}

	@Override
	public String toString() {
		return "stable";
	}
}
