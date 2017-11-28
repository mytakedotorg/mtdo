package org.mytake.foundation;

import java.util.ArrayList;
import java.util.List;

public class Documents {
	public static Documents national() {
		Documents documents = new Documents();
		documents.add("United States Constitution", "1788-06-21");
		documents.add("Bill of Rights", "1791-12-15");
		documents.add("Amendment 11", "1795-02-07");
		documents.add("Amendment 12", "1804-06-15");
		documents.add("Amendment 13", "1865-12-06");
		documents.add("Amendment 14", "1868-07-09");
		documents.add("Amendment 15", "1870-02-03");
		documents.add("Amendment 16", "1913-02-03");
		documents.add("Amendment 17", "1913-04-08");
		documents.add("Amendment 18", "1919-01-16");
		documents.add("Amendment 19", "1920-08-18");
		documents.add("Amendment 20", "1933-01-23");
		documents.add("Amendment 21", "1933-12-05");
		documents.add("Amendment 22", "1951-02-27");
		documents.add("Amendment 23", "1961-03-29");
		documents.add("Amendment 24", "1964-01-23");
		documents.add("Amendment 25", "1967-02-10");
		documents.add("Amendment 26", "1971-07-01");
		documents.add("Amendment 27", "1992-05-05");
		return documents;
	}

	static class DocumentFact {
		public String title;
		public String filename;
		public String primaryDate;
		public String primaryDateKind;
	}

	List<DocumentFact> facts = new ArrayList<>();

	private DocumentFact add(String title, String date) {
		DocumentFact fact = new DocumentFact();
		fact.title = title;
		fact.primaryDate = date;
		fact.primaryDateKind = "ratified";
		facts.add(fact);
		return fact;
	}
}
