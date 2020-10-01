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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.gui;


import java.util.Arrays;
import org.eclipse.jface.text.DefaultIndentLineAutoEditStrategy;
import org.eclipse.jface.text.IAutoEditStrategy;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IDocumentPartitioner;
import org.eclipse.jface.text.TextAttribute;
import org.eclipse.jface.text.presentation.IPresentationReconciler;
import org.eclipse.jface.text.presentation.PresentationReconciler;
import org.eclipse.jface.text.rules.DefaultDamagerRepairer;
import org.eclipse.jface.text.rules.EndOfLineRule;
import org.eclipse.jface.text.rules.FastPartitioner;
import org.eclipse.jface.text.rules.IPredicateRule;
import org.eclipse.jface.text.rules.RuleBasedPartitionScanner;
import org.eclipse.jface.text.rules.Token;
import org.eclipse.jface.text.source.ISourceViewer;
import org.eclipse.jface.text.source.SourceViewer;
import org.eclipse.jface.text.source.SourceViewerConfiguration;
import org.eclipse.swt.graphics.Color;

public interface SyntaxHighlighter {
	static final Color BLACK = new Color(0, 0, 0);

	void setup(SourceViewer sourceViewer, IDocument doc);

	public static SyntaxHighlighter none() {
		return SourceViewer::setDocument;
	}

	public static SyntaxHighlighter ini() {
		return RuleBasedHighlighter.INI;
	}

	static class Rule {
		final String contentType;
		final IPredicateRule predicateRule;
		final TextAttribute style;

		Rule(String contentType, IPredicateRule predicateRule, TextAttribute style) {
			this.contentType = contentType;
			this.predicateRule = predicateRule;
			this.style = style;
		}
	}

	static class RuleBasedHighlighter implements SyntaxHighlighter {
		private static String COMMENT = "__comment_type";
		private static Color COMMENT_COLOR = new Color(63, 127, 95);
		private static final SyntaxHighlighter INI = new RuleBasedHighlighter(
				new Rule(COMMENT, new EndOfLineRule(";", new Token(COMMENT)), new TextAttribute(COMMENT_COLOR)));

		public static final String NONE = "None";

		public static final String DEFAULT_PARTITION_TYPE = "__dftl_partition_content_type";

		private final Rule[] rules;

		RuleBasedHighlighter(Rule... rules) {
			this.rules = rules;
		}

		private String[] getContentTypes() {
			return Arrays.stream(rules)
					.map(r -> r.contentType)
					.toArray(String[]::new);
		}

		private IPredicateRule[] getPredicateRules() {
			return Arrays.stream(rules)
					.map(r -> r.predicateRule)
					.toArray(IPredicateRule[]::new);
		}

		private class FlexibleHighlightingConfig extends SourceViewerConfiguration {
			/** Gets the presentation reconciler */
			@Override
			public IPresentationReconciler getPresentationReconciler(ISourceViewer sourceViewer) {
				PresentationReconciler reconciler = new PresentationReconciler();

				// add a damager / repairer for each rule
				for (Rule rule : rules) {
					RuleBasedPartitionScanner scanner = new RuleBasedPartitionScanner();
					scanner.setDefaultReturnToken(new Token(rule.style));
					DefaultDamagerRepairer dr = new DefaultDamagerRepairer(scanner);
					reconciler.setDamager(dr, rule.contentType);
					reconciler.setRepairer(dr, rule.contentType);
				}

				// add one for the background
				RuleBasedPartitionScanner scanner = new RuleBasedPartitionScanner();
				scanner.setDefaultReturnToken(new Token(new TextAttribute(BLACK)));
				DefaultDamagerRepairer dr = new DefaultDamagerRepairer(new RuleBasedPartitionScanner());
				reconciler.setDamager(dr, DEFAULT_PARTITION_TYPE);
				reconciler.setRepairer(dr, DEFAULT_PARTITION_TYPE);

				return reconciler;
			}

			/** Gets the types of content that this highlighter can deal with */
			@Override
			public String[] getConfiguredContentTypes(ISourceViewer sourceViewer) {
				String[] pieces = new String[rules.length + 1];
				pieces[0] = DEFAULT_PARTITION_TYPE;
				for (int i = 0; i < rules.length; ++i) {
					pieces[i + 1] = rules[i].contentType;
				}
				return pieces;
			}

			@Override
			public IAutoEditStrategy[] getAutoEditStrategies(ISourceViewer sourceViewer, String contentType) {
				return new IAutoEditStrategy[]{new DefaultIndentLineAutoEditStrategy()};
			}
		}

		@Override
		public void setup(SourceViewer viewer, IDocument document) {
			viewer.unconfigure();

			FlexibleHighlightingConfig config = new FlexibleHighlightingConfig();

			// setup the scanner
			RuleBasedPartitionScanner scanner = new RuleBasedPartitionScanner();
			scanner.setPredicateRules(getPredicateRules());

			// setup the partitioner
			IDocumentPartitioner partitioner = new FastPartitioner(scanner, getContentTypes());
			partitioner.connect(document);
			document.setDocumentPartitioner(partitioner);

			// setup the viewer
			viewer.setDocument(document);
			viewer.configure(config);
		}
	}
}
