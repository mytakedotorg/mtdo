/*
 * This file is generated by jOOQ.
 */
package db.tables.records;


import db.tables.Bookmark;

import java.time.LocalDateTime;

import org.jooq.Field;
import org.jooq.Record4;
import org.jooq.Record5;
import org.jooq.Row5;
import org.jooq.impl.UpdatableRecordImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class BookmarkRecord extends UpdatableRecordImpl<BookmarkRecord> implements Record5<Integer, LocalDateTime, String, Integer, Integer> {

    private static final long serialVersionUID = -1723588572;

    /**
     * Setter for <code>public.bookmark.saved_by</code>.
     */
    public BookmarkRecord setSavedBy(Integer value) {
        set(0, value);
        return this;
    }

    /**
     * Getter for <code>public.bookmark.saved_by</code>.
     */
    public Integer getSavedBy() {
        return (Integer) get(0);
    }

    /**
     * Setter for <code>public.bookmark.saved_on</code>.
     */
    public BookmarkRecord setSavedOn(LocalDateTime value) {
        set(1, value);
        return this;
    }

    /**
     * Getter for <code>public.bookmark.saved_on</code>.
     */
    public LocalDateTime getSavedOn() {
        return (LocalDateTime) get(1);
    }

    /**
     * Setter for <code>public.bookmark.fact</code>.
     */
    public BookmarkRecord setFact(String value) {
        set(2, value);
        return this;
    }

    /**
     * Getter for <code>public.bookmark.fact</code>.
     */
    public String getFact() {
        return (String) get(2);
    }

    /**
     * Setter for <code>public.bookmark.cut_start</code>.
     */
    public BookmarkRecord setCutStart(Integer value) {
        set(3, value);
        return this;
    }

    /**
     * Getter for <code>public.bookmark.cut_start</code>.
     */
    public Integer getCutStart() {
        return (Integer) get(3);
    }

    /**
     * Setter for <code>public.bookmark.cut_end</code>.
     */
    public BookmarkRecord setCutEnd(Integer value) {
        set(4, value);
        return this;
    }

    /**
     * Getter for <code>public.bookmark.cut_end</code>.
     */
    public Integer getCutEnd() {
        return (Integer) get(4);
    }

    // -------------------------------------------------------------------------
    // Primary key information
    // -------------------------------------------------------------------------

    @Override
    public Record4<Integer, String, Integer, Integer> key() {
        return (Record4) super.key();
    }

    // -------------------------------------------------------------------------
    // Record5 type implementation
    // -------------------------------------------------------------------------

    @Override
    public Row5<Integer, LocalDateTime, String, Integer, Integer> fieldsRow() {
        return (Row5) super.fieldsRow();
    }

    @Override
    public Row5<Integer, LocalDateTime, String, Integer, Integer> valuesRow() {
        return (Row5) super.valuesRow();
    }

    @Override
    public Field<Integer> field1() {
        return Bookmark.BOOKMARK.SAVED_BY;
    }

    @Override
    public Field<LocalDateTime> field2() {
        return Bookmark.BOOKMARK.SAVED_ON;
    }

    @Override
    public Field<String> field3() {
        return Bookmark.BOOKMARK.FACT;
    }

    @Override
    public Field<Integer> field4() {
        return Bookmark.BOOKMARK.CUT_START;
    }

    @Override
    public Field<Integer> field5() {
        return Bookmark.BOOKMARK.CUT_END;
    }

    @Override
    public Integer component1() {
        return getSavedBy();
    }

    @Override
    public LocalDateTime component2() {
        return getSavedOn();
    }

    @Override
    public String component3() {
        return getFact();
    }

    @Override
    public Integer component4() {
        return getCutStart();
    }

    @Override
    public Integer component5() {
        return getCutEnd();
    }

    @Override
    public Integer value1() {
        return getSavedBy();
    }

    @Override
    public LocalDateTime value2() {
        return getSavedOn();
    }

    @Override
    public String value3() {
        return getFact();
    }

    @Override
    public Integer value4() {
        return getCutStart();
    }

    @Override
    public Integer value5() {
        return getCutEnd();
    }

    @Override
    public BookmarkRecord value1(Integer value) {
        setSavedBy(value);
        return this;
    }

    @Override
    public BookmarkRecord value2(LocalDateTime value) {
        setSavedOn(value);
        return this;
    }

    @Override
    public BookmarkRecord value3(String value) {
        setFact(value);
        return this;
    }

    @Override
    public BookmarkRecord value4(Integer value) {
        setCutStart(value);
        return this;
    }

    @Override
    public BookmarkRecord value5(Integer value) {
        setCutEnd(value);
        return this;
    }

    @Override
    public BookmarkRecord values(Integer value1, LocalDateTime value2, String value3, Integer value4, Integer value5) {
        value1(value1);
        value2(value2);
        value3(value3);
        value4(value4);
        value5(value5);
        return this;
    }

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    /**
     * Create a detached BookmarkRecord
     */
    public BookmarkRecord() {
        super(Bookmark.BOOKMARK);
    }

    /**
     * Create a detached, initialised BookmarkRecord
     */
    public BookmarkRecord(Integer savedBy, LocalDateTime savedOn, String fact, Integer cutStart, Integer cutEnd) {
        super(Bookmark.BOOKMARK);

        set(0, savedBy);
        set(1, savedOn);
        set(2, fact);
        set(3, cutStart);
        set(4, cutEnd);
    }
}