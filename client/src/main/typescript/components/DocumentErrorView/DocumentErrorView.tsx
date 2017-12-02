import * as React from "react";

interface DocumentErrorViewProps {
  onRetryClick: () => any;
}

const DocumentErrorView: React.StatelessComponent<
  DocumentErrorViewProps
> = props =>
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">
      Error loading Foundation Document
    </h2>
    <button
      className="editor__button editor__button--reload"
      onClick={props.onRetryClick}
    >
      retry?
    </button>
  </div>;

export default DocumentErrorView;
