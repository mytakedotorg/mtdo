/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.factset.swt;


import com.diffplug.common.swt.ControlWrapper;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Control;

/**
 * SWT provides {@link ScrolledComposite} which provides a wealth of
 * scrolling behavior ([google](https://www.google.com/search?q=SWT+ScrolledComposite)).
 * However, the most common case is that you only want to scroll vertically.  This class
 * makes that easy.  Just create your content with {@link #getParentForContent()} as the
 * parent, and then set it to be the content with {@link #setContent(Control)}.  Easy!
 */
public class VScrollCtl extends ControlWrapper.AroundControl<ScrolledComposite> {
	public VScrollCtl(Composite parent, int style) {
		super(new ScrolledComposite(parent, SWT.VERTICAL | style));
	}

	public ScrolledComposite getParentForContent() {
		return wrapped;
	}

	public void setContent(ControlWrapper wrapper) {
		setContent(wrapper.getRootControl());
	}

	public void setContent(Control content) {
		wrapped.setContent(content);
		wrapped.setExpandHorizontal(true);
		wrapped.setExpandVertical(true);
		wrapped.addListener(SWT.Resize, e -> {
			int scrollWidth = wrapped.getVerticalBar().getSize().x;
			Point size = wrapped.getSize();
			Point contentSize = content.computeSize(size.x - scrollWidth, SWT.DEFAULT);
			content.setSize(contentSize);
			wrapped.setMinSize(contentSize);
		});
	}
}
