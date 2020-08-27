/*
 * This file is generated by jOOQ.
 */
package db.tables.records;


import db.tables.Follow;

import java.time.LocalDateTime;

import org.jooq.Field;
import org.jooq.Record2;
import org.jooq.Record3;
import org.jooq.Row3;
import org.jooq.impl.UpdatableRecordImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class FollowRecord extends UpdatableRecordImpl<FollowRecord> implements Record3<Integer, Integer, LocalDateTime> {

    private static final long serialVersionUID = 606182094;

    /**
     * Setter for <code>public.follow.author</code>.
     */
    public FollowRecord setAuthor(Integer value) {
        set(0, value);
        return this;
    }

    /**
     * Getter for <code>public.follow.author</code>.
     */
    public Integer getAuthor() {
        return (Integer) get(0);
    }

    /**
     * Setter for <code>public.follow.follower</code>.
     */
    public FollowRecord setFollower(Integer value) {
        set(1, value);
        return this;
    }

    /**
     * Getter for <code>public.follow.follower</code>.
     */
    public Integer getFollower() {
        return (Integer) get(1);
    }

    /**
     * Setter for <code>public.follow.followed_at</code>.
     */
    public FollowRecord setFollowedAt(LocalDateTime value) {
        set(2, value);
        return this;
    }

    /**
     * Getter for <code>public.follow.followed_at</code>.
     */
    public LocalDateTime getFollowedAt() {
        return (LocalDateTime) get(2);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    @Override
    public Record2<Integer, Integer> key() {
        return (Record2) super.key();
    }

    // -------------------------------------------------------------------------
    // Record3 type implementation
    // -------------------------------------------------------------------------

    @Override
    public Row3<Integer, Integer, LocalDateTime> fieldsRow() {
        return (Row3) super.fieldsRow();
    }

    @Override
    public Row3<Integer, Integer, LocalDateTime> valuesRow() {
        return (Row3) super.valuesRow();
    }

    @Override
    public Field<Integer> field1() {
        return Follow.FOLLOW.AUTHOR;
    }

    @Override
    public Field<Integer> field2() {
        return Follow.FOLLOW.FOLLOWER;
    }

    @Override
    public Field<LocalDateTime> field3() {
        return Follow.FOLLOW.FOLLOWED_AT;
    }

    @Override
    public Integer component1() {
        return getAuthor();
    }

    @Override
    public Integer component2() {
        return getFollower();
    }

    @Override
    public LocalDateTime component3() {
        return getFollowedAt();
    }

    @Override
    public Integer value1() {
        return getAuthor();
    }

    @Override
    public Integer value2() {
        return getFollower();
    }

    @Override
    public LocalDateTime value3() {
        return getFollowedAt();
    }

    @Override
    public FollowRecord value1(Integer value) {
        setAuthor(value);
        return this;
    }

    @Override
    public FollowRecord value2(Integer value) {
        setFollower(value);
        return this;
    }

    @Override
    public FollowRecord value3(LocalDateTime value) {
        setFollowedAt(value);
        return this;
    }

    @Override
    public FollowRecord values(Integer value1, Integer value2, LocalDateTime value3) {
        value1(value1);
        value2(value2);
        value3(value3);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached FollowRecord
     */
    public FollowRecord() {
        super(Follow.FOLLOW);
    }

    /**
     * Create a detached, initialised FollowRecord
     */
    public FollowRecord(Integer author, Integer follower, LocalDateTime followedAt) {
        super(Follow.FOLLOW);

        set(0, author);
        set(1, follower);
        set(2, followedAt);
    }
}
