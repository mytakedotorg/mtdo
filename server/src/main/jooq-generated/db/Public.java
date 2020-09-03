/*
 * This file is generated by jOOQ.
 */
package db;


import db.tables.Account;
import db.tables.Bookmark;
import db.tables.BookmarksMod;
import db.tables.FlywaySchemaHistory;
import db.tables.Follow;
import db.tables.FoundationRev;
import db.tables.Loginlink;
import db.tables.Moderator;
import db.tables.Takedraft;
import db.tables.Takepublished;
import db.tables.Takereaction;
import db.tables.Takerevision;

import java.util.Arrays;
import java.util.List;

import org.jooq.Catalog;
import org.jooq.Sequence;
import org.jooq.Table;
import org.jooq.impl.SchemaImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Public extends SchemaImpl {

    private static final long serialVersionUID = -1192245225;

    /**
     * The reference instance of <code>public</code>
     */
    public static final Public PUBLIC = new Public();

    /**
     * The table <code>public.account</code>.
     */
    public final Account ACCOUNT = Account.ACCOUNT;

    /**
     * The table <code>public.bookmark</code>.
     */
    public final Bookmark BOOKMARK = Bookmark.BOOKMARK;

    /**
     * The table <code>public.bookmarks_mod</code>.
     */
    public final BookmarksMod BOOKMARKS_MOD = BookmarksMod.BOOKMARKS_MOD;

    /**
     * The table <code>public.flyway_schema_history</code>.
     */
    public final FlywaySchemaHistory FLYWAY_SCHEMA_HISTORY = FlywaySchemaHistory.FLYWAY_SCHEMA_HISTORY;

    /**
     * The table <code>public.follow</code>.
     */
    public final Follow FOLLOW = Follow.FOLLOW;

    /**
     * The table <code>public.foundation_rev</code>.
     */
    public final FoundationRev FOUNDATION_REV = FoundationRev.FOUNDATION_REV;

    /**
     * The table <code>public.loginlink</code>.
     */
    public final Loginlink LOGINLINK = Loginlink.LOGINLINK;

    /**
     * The table <code>public.moderator</code>.
     */
    public final Moderator MODERATOR = Moderator.MODERATOR;

    /**
     * The table <code>public.takedraft</code>.
     */
    public final Takedraft TAKEDRAFT = Takedraft.TAKEDRAFT;

    /**
     * The table <code>public.takepublished</code>.
     */
    public final Takepublished TAKEPUBLISHED = Takepublished.TAKEPUBLISHED;

    /**
     * The table <code>public.takereaction</code>.
     */
    public final Takereaction TAKEREACTION = Takereaction.TAKEREACTION;

    /**
     * The table <code>public.takerevision</code>.
     */
    public final Takerevision TAKEREVISION = Takerevision.TAKEREVISION;

    /**
     * No further instances allowed
     */
    private Public() {
        super("public", null);
    }


    @Override
    public Catalog getCatalog() {
        return DefaultCatalog.DEFAULT_CATALOG;
    }

    @Override
    public final List<Sequence<?>> getSequences() {
        return Arrays.<Sequence<?>>asList(
            Sequences.ACCOUNT_ID_SEQ,
            Sequences.TAKEDRAFT_ID_SEQ,
            Sequences.TAKEPUBLISHED_ID_SEQ,
            Sequences.TAKEREVISION_ID_SEQ);
    }

    @Override
    public final List<Table<?>> getTables() {
        return Arrays.<Table<?>>asList(
            Account.ACCOUNT,
            Bookmark.BOOKMARK,
            BookmarksMod.BOOKMARKS_MOD,
            FlywaySchemaHistory.FLYWAY_SCHEMA_HISTORY,
            Follow.FOLLOW,
            FoundationRev.FOUNDATION_REV,
            Loginlink.LOGINLINK,
            Moderator.MODERATOR,
            Takedraft.TAKEDRAFT,
            Takepublished.TAKEPUBLISHED,
            Takereaction.TAKEREACTION,
            Takerevision.TAKEREVISION);
    }
}
