package org.mytake.gradle.java2ts;

import org.jsweet.transpiler.JSweetContext;
import org.jsweet.transpiler.JSweetFactory;
import org.jsweet.transpiler.extension.PrinterAdapter;

/** Customize the jsweet transpilation process. */
public class MytakeJsweetFactory extends JSweetFactory {
	@Override
	public PrinterAdapter createAdapter(JSweetContext context) {
		return new JsoniterAnyAdapter(super.createAdapter(context));
	}

	/** Convert the jsoniter Any into the typescript any. */
	static class JsoniterAnyAdapter extends PrinterAdapter {
		public JsoniterAnyAdapter(PrinterAdapter parent) {
			super(parent);
			addTypeMapping("com.jsoniter.any.Any", "any");
		}
	}
}
