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
 * You can contact us at team@mytake.org
 */
package common;

import com.diffplug.common.base.Preconditions;
import com.google.inject.Binder;
import com.google.inject.Key;
import com.typesafe.config.Config;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import org.jooby.Deferred.Initializer;
import org.jooby.Deferred.Initializer0;
import org.jooby.Env;
import org.jooby.FlashScope;
import org.jooby.Jooby;
import org.jooby.LifeCycle;
import org.jooby.Registry;
import org.jooby.Request;
import org.jooby.Response;
import org.jooby.Result;
import org.jooby.Route;
import org.jooby.Route.After;
import org.jooby.Route.AssetDefinition;
import org.jooby.Route.Before;
import org.jooby.Route.Collection;
import org.jooby.Route.Complete;
import org.jooby.Route.Definition;
import org.jooby.Route.Filter;
import org.jooby.Route.Handler;
import org.jooby.Route.Mapper;
import org.jooby.Route.OneArgHandler;
import org.jooby.Route.ZeroArgHandler;
import org.jooby.Router;
import org.jooby.Sse.Handler1;
import org.jooby.WebSocket.OnMessage;
import org.jooby.WebSocket.OnOpen;
import org.jooby.funzy.Throwing;
import org.jooby.funzy.Throwing.Consumer;
import org.jooby.handlers.AssetHandler;
import org.jooby.internal.handlers.FlashScopeHandler;

/**
 * Flash workaround so that we can use flash in the
 * AuthModule error handler for JWTException.  A bit much?
 * 
 * https://github.com/jooby-project/jooby/issues/1299
 * 
 * Usage: instead of `use(new FlashScope())`, do `use(new MyFlash())`.
 * Then, in your error handler, you need to implement the handler like this
 * 
 * ```java
 * req.require(MyFlash.class).runFlashInErrorHandler(req, rsp, () -> {
 *    //do your handler
 *    req.flash('key', 'value');
 *    return Results.whatever();
 * })
 * ```
 */
public class MyFlash implements Jooby.Module {
	private FlashScopeHandler flashScopeHandler;

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Router myRouter = new UnsupportedRouter() {
			@Override
			public Route.Definition use(String method, String path, Route.Filter filter) {
				flashScopeHandler = (FlashScopeHandler) filter;
				return env.router().use(method, path, filter);
			}
		};
		Env myEnv = new UnsupportedEnv() {
			@Override
			public Router router() throws UnsupportedOperationException {
				return myRouter;
			}
		};
		new FlashScope().configure(myEnv, conf, null);
		binder.bind(MyFlash.class).toInstance(this);
	}

	public void runFlashInErrorHandler(Request req, Response rsp, Throwing.Supplier<Result> handlerImplementation) throws Throwable {
		Route.Chain noOpChain = new Route.Chain() {
			@Override
			public List<Route> routes() {
				throw new UnsupportedOperationException();
			}

			@Override
			public void next(String prefix, Request req, Response rsp) throws Throwable {
				// no action required
			}
		};
		class AfterBox {
			Route.After handler;
		}
		AfterBox afterBox = new AfterBox();
		Response.Forwarding rspInterceptAfter = new Response.Forwarding(rsp) {
			@Override
			public void after(final Route.After handler) {
				Preconditions.checkArgument(afterBox.handler == null, "Should only be called once");
				afterBox.handler = Objects.requireNonNull(handler);
			}
		};
		flashScopeHandler.handle(req, rspInterceptAfter, noOpChain);
		Result result = handlerImplementation.get();
		rsp.send(afterBox.handler.handle(req, rsp, result));
	}

	//////////////////////////////////////////
	// everything below this is boilerplate //
	//////////////////////////////////////////
	static class UnsupportedRouter implements Router {
		@Override
		public Router use(Jooby app) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection path(String path, Runnable action) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Router use(String path, Jooby app) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition use(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition use(String method, String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition use(String method, String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition use(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition use(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition get(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, String path3, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition get(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, String path3, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition get(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, String path3, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition get(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection get(String path1, String path2, String path3, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition post(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, String path3, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition post(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, String path3, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition post(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, String path3, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition post(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection post(String path1, String path2, String path3, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition head(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition head(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition head(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition head(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition head() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition options(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition options(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition options(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition options(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition options() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition put(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, String path3, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition put(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, String path3, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition put(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, String path3, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition put(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection put(String path1, String path2, String path3, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition patch(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, String path3, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition patch(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, String path3, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition patch(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, String path3, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition patch(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection patch(String path1, String path2, String path3, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition delete(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, String path3, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition delete(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, String path3, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition delete(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, String path3, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition delete(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection delete(String path1, String path2, String path3, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition trace(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition trace(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition trace(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition trace(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition trace() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition connect(String path, Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition connect(String path, OneArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition connect(String path, ZeroArgHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition connect(String path, Filter filter) {
			throw new UnsupportedOperationException();
		}

		@Override
		public AssetDefinition assets(String path, Path basedir) {
			throw new UnsupportedOperationException();
		}

		@Override
		public AssetDefinition assets(String path, String location) {
			throw new UnsupportedOperationException();
		}

		@Override
		public AssetDefinition assets(String path, AssetHandler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection use(Class<?> routeClass) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection use(String path, Class<?> routeClass) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition before(String method, String pattern, Before handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition after(String method, String pattern, After handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition complete(String method, String pattern, Complete handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public org.jooby.WebSocket.Definition ws(String path, OnOpen handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> org.jooby.WebSocket.Definition ws(String path, Class<? extends OnMessage<T>> handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition sse(String path, org.jooby.Sse.Handler handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Definition sse(String path, Handler1 handler) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Collection with(Runnable callback) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Router map(Mapper<?> mapper) {
			throw new UnsupportedOperationException();
		}

		@Override
		public Router err(org.jooby.Err.Handler err) {
			throw new UnsupportedOperationException();
		}

		@Override
		public OneArgHandler promise(Initializer initializer) {
			throw new UnsupportedOperationException();
		}

		@Override
		public OneArgHandler promise(String executor, Initializer initializer) {
			throw new UnsupportedOperationException();
		}

		@Override
		public OneArgHandler promise(Initializer0 initializer) {
			throw new UnsupportedOperationException();
		}

		@Override
		public OneArgHandler promise(String executor, Initializer0 initializer) {
			throw new UnsupportedOperationException();
		}
	}

	static class UnsupportedEnv implements Env {
		@Override
		public LifeCycle onStart(Consumer<Registry> task) {
			throw new UnsupportedOperationException();
		}

		@Override
		public LifeCycle onStarted(Consumer<Registry> task) {
			throw new UnsupportedOperationException();
		}

		@Override
		public LifeCycle onStop(Consumer<Registry> task) {
			throw new UnsupportedOperationException();
		}

		@Override
		public String name() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Router router() throws UnsupportedOperationException {
			throw new UnsupportedOperationException();
		}

		@Override
		public Config config() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Locale locale() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Map<String, Function<String, String>> xss() {
			throw new UnsupportedOperationException();
		}

		@Override
		public Env xss(String name, Function<String, String> escaper) {
			throw new UnsupportedOperationException();
		}

		@Override
		public List<Consumer<Registry>> startTasks() {
			throw new UnsupportedOperationException();
		}

		@Override
		public List<Consumer<Registry>> startedTasks() {
			throw new UnsupportedOperationException();
		}

		@Override
		public List<Consumer<Registry>> stopTasks() {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> Env set(Key<T> key, T value) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> T unset(Key<T> key) {
			throw new UnsupportedOperationException();
		}

		@Override
		public <T> Optional<T> get(Key<T> key) {
			throw new UnsupportedOperationException();
		}
	}
}
