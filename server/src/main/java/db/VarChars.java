/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package db;

/** Character limits for various database columns. */
public class VarChars {
	/** ACCOUNT.USERNAME */
	public static final int USERNAME = 60;
	/** ACCOUNT.EMAIL */
	public static final int EMAIL = 513;
	/** ACCOUNT.NAME */
	public static final int NAME = 255;
	/** TAKEREVISION.TITLE, TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG */
	public static final int TITLE = 255;
	/** LOGINLINK.CODE, CONFIRMACCOUNT.CODE */
	public static final int CODE = 44;
}
