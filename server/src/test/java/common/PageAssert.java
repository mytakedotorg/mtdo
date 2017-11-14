/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Throwing;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import io.restassured.response.ValidatableResponse;
import org.assertj.core.api.AbstractCharSequenceAssert;
import org.assertj.core.api.Assertions;
import org.jooby.Jooby;
import org.jooby.Status;
import org.jooby.rocker.Rockerby;

/**
 * Performs assertions on page content.  If a test fails,
 * it displays the test in a browser so you can more easily
 * see what went wrong.
 */
public class PageAssert {
	public static PageAssert assertThatGet(String url, Status status) {
		return assertThat(RestAssured.get(url), status);
	}

	public static PageAssert assertThat(Response response, Status status) {
		return new PageAssert(response).responseAssert(asserter -> {
			asserter.statusCode(status.value());
		});
	}

	public static PageAssert assertThatStaticUrl(Jooby.Module module, String url) {
		Dev.rockerDevInit();
		Jooby jooby = new Jooby();
		jooby.use(new Rockerby());
		jooby.use(new CustomAssets());
		jooby.use(module);
		jooby.start("server.join=false");
		Response response = RestAssured.get(url);
		jooby.stop();
		return assertThat(response, Status.OK);
	}

	private final Response response;
	private final String body;

	private PageAssert(Response response) {
		this.response = response;
		this.body = response.asString();
	}

	public PageAssert responseAssert(Throwing.Consumer<ValidatableResponse> responseAsserter) {
		return assertOnFail(() -> {
			responseAsserter.accept(response.then());
		});
	}

	/** Asserts on the body of the page using AbstractCharSequenceAssert. */
	public PageAssert bodyAssert(Throwing.Consumer<AbstractCharSequenceAssert<?, String>> bodyAsserter) {
		return bodyAssertRaw(body -> {
			bodyAsserter.accept(Assertions.assertThat(body));
		});
	}

	/** Asserts on the body of the page using a raw string. */
	public PageAssert bodyAssertRaw(Throwing.Consumer<String> bodyAsserter) {
		return assertOnFail(() -> {
			bodyAsserter.accept(body);
		});
	}

	private PageAssert assertOnFail(Throwing.Runnable run) {
		try {
			run.run();
		} catch (Throwable t) {
			if (OpenBrowser.isInteractive()) {
				t.printStackTrace();
				new OpenBrowser()
						.add("/failedAssertion", body)
						.isYes("Failed assertion, press any button");
			}
			if (t instanceof Error) {
				throw (Error) t;
			} else {
				throw Errors.asRuntime(t);
			}
		}
		return this;
	}
}
