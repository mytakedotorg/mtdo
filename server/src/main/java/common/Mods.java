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
package common;

import static db.Tables.ACCOUNT;
import static db.Tables.MODERATOR;
import static db.Tables.TAKEDRAFT;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;
import static db.Tables.TAKEREVISION;

import auth.AuthUser;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.base.Unhandled;
import com.google.inject.Binder;
import com.google.inject.Inject;
import com.typesafe.config.Config;
import db.enums.Reaction;
import db.tables.records.TakerevisionRecord;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java2ts.Routes;
import org.apache.commons.mail.HtmlEmail;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Registry;
import org.jooby.quartz.Quartz;
import org.jooby.quartz.Scheduled;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.Result;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.impl.DSL;

public class Mods {
	private Registry registry;

	/** Sends an email to all of the moderators.  Don't need to set "to" or "from", and subject will automatically have [MyTake.org mod] prepended. */
	public void send(Throwing.Consumer<HtmlEmail> sender) throws Throwable {
		List<String> moderatorEmails;
		try (DSLContext dsl = registry.require(DSLContext.class)) {
			moderatorEmails = dsl.select()
					.from(ACCOUNT.join(MODERATOR)
							.on(ACCOUNT.ID.eq(MODERATOR.ID)))
					.fetch(ACCOUNT.EMAIL);
		}
		if (moderatorEmails.isEmpty()) {
			return;
		}
		registry.require(EmailSender.class).send(htmlEmail -> {
			for (String moderatorEmail : moderatorEmails) {
				htmlEmail.addTo(moderatorEmail);
			}
			sender.accept(htmlEmail);
			htmlEmail.setSubject("[MyTake.org mod] " + htmlEmail.getSubject());
		});
	}

	private static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			// setup the mods
			Mods moderators = new Mods();
			binder.bind(Mods.class).toInstance(moderators);
			env.onStart(registry -> {
				moderators.registry = registry;
			});
			// add route to allow admin to view drafts
			env.router().get(Routes.MODS_DRAFTS + ":id", req -> {
				int draftId = req.param("id").intValue();
				AuthUser user = AuthUser.auth(req);
				try (DSLContext dsl = req.require(DSLContext.class)) {
					user.requireMod(dsl);
					TakerevisionRecord rev = dsl.selectFrom(TAKEREVISION)
							.where(TAKEREVISION.ID.eq(
									dsl.select(TAKEDRAFT.LAST_REVISION)
											.from(TAKEDRAFT)
											.where(TAKEDRAFT.ID.eq(draftId))))
							.fetchOne();
					if (rev == null) {
						throw RedirectException.notFoundError();
					}
					return views.Drafts.editTake.template(rev.getTitle(), rev.getBlocks(), draftId, rev.getId());
				}
			});
		}
	}

	public static void init(Jooby jooby) {
		jooby.use(new Mods.Module());
		jooby.use(new Quartz().with(ModJobs.class));
	}

	public static String table(String... keyValue) {
		StringBuilder builder = new StringBuilder();
		builder.append("<body><table>");
		for (int i = 0; i < keyValue.length / 2; ++i) {
			String key = keyValue[2 * i];
			String value = keyValue[2 * i + 1];
			builder.append("<tr>");
			builder.append("<th>");
			builder.append(key);
			builder.append("</th>");
			builder.append("<td>");
			if (value.startsWith("https://")) {
				builder.append("<a href=\"" + value + "\">" + value + "</a>");
			} else {
				builder.append(value);
			}
			builder.append("</td>");
			builder.append("</tr>");
		}
		builder.append("</table></body>");
		return builder.toString();
	}

	public static class ViewsStars {
		public String userSlug;
		public int views, stars;

		public int percentRatio() {
			return stars * 100 / views;
		}

		public String link() {
			return "<a href=\"https://mytake.org/" + userSlug + "\">" + userSlug + "</a>";
		}
	}

	public static class ModJobs {
		Registry registry;

		@Inject
		public ModJobs(Registry registry) {
			this.registry = registry;
		}

		/** 5pm EST in UTC. */
		@Scheduled("0 0 22 * * ?")
		public void dailySummary() throws Throwable {
			String html = generateSummaryHtml();
			registry.require(Mods.class).send(email -> {
				email.setSubject("Daily summary");
				email.setMsg(html);
			});
		}

		String generateSummaryHtml() {
			try (DSLContext dsl = registry.require(DSLContext.class)) {
				Time.AddableTimestamp now = registry.require(Time.class).nowTimestamp();

				Table<?> table = dsl.select(DSL.count().as("likecount"), TAKEREACTION.TAKE_ID, TAKEREACTION.KIND)
						.from(TAKEREACTION)
						.where(last24hrs(now, TAKEREACTION.REACTED_AT).and(TAKEREACTION.KIND.in(Reaction.view, Reaction.like)))
						.groupBy(TAKEREACTION.TAKE_ID, TAKEREACTION.KIND)
						.asTable();
				@SuppressWarnings("unchecked")
				Field<Integer> _count = (Field<Integer>) table.fields()[0];
				Field<Integer> _takeId = table.field(TAKEREACTION.TAKE_ID);
				Field<Reaction> _kind = table.field(TAKEREACTION.KIND);
				Result<?> viewsAndLikes = dsl.select(_count, ACCOUNT.USERNAME, TAKEPUBLISHED.TITLE_SLUG, _kind)
						.from(table)
						.join(TAKEPUBLISHED).on(_takeId.eq(TAKEPUBLISHED.ID))
						.join(ACCOUNT).on(TAKEPUBLISHED.USER_ID.eq(ACCOUNT.ID))
						.fetch();
				Map<String, ViewsStars> map = new HashMap<>();
				for (Record record : viewsAndLikes) {
					String userSlug = record.get(ACCOUNT.USERNAME) + "/" + record.get(TAKEPUBLISHED.TITLE_SLUG);
					map.compute(userSlug, (us, viewsStars) -> {
						if (viewsStars == null) {
							viewsStars = new ViewsStars();
							viewsStars.userSlug = us;
						}
						Reaction kind = record.get(_kind);
						int count = record.get(_count);
						// @formatter:off
						switch (kind) {
						case view: viewsStars.views = count; break;
						case like: viewsStars.stars = count; break;
						default:   throw Unhandled.enumException(kind);
						}
						// @formatter:on
						return viewsStars;
					});
				}
				List<ViewsStars> viewsStars = new ArrayList<ViewsStars>(map.values());
				Collections.sort(viewsStars, Comparator.<ViewsStars> comparingInt(v -> v.views)
						.thenComparing(v -> v.stars)
						.thenComparing(v -> v.userSlug));

				Result<?> recentDrafts = dsl.select(TAKEDRAFT.ID, TAKEREVISION.TITLE, ACCOUNT.USERNAME)
						.from(TAKEDRAFT
								.join(ACCOUNT).on(ACCOUNT.ID.eq(TAKEDRAFT.USER_ID))
								.join(TAKEREVISION).on(TAKEREVISION.ID.eq(TAKEDRAFT.LAST_REVISION)))
						.where(last24hrs(now, TAKEREVISION.CREATED_AT))
						.orderBy(TAKEREVISION.CREATED_AT.desc(), TAKEREVISION.ID.desc())
						.fetch();
				return views.Mods.dailySummary.template(viewsStars, recentDrafts).renderToString();
			}
		}

		private Condition last24hrs(Time.AddableTimestamp now, TableField<?, Timestamp> field) {
			return field.between(now.minus(24, TimeUnit.HOURS), now);
		}
	}
}
