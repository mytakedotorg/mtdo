import * as React from "react";
import BlockEditor, {
  DocumentBlock,
  ParagraphBlock,
  TakeBlock,
  TakeDocument,
  VideoBlock
} from "../BlockEditor";
import TimelineView from "../TimelineView";
import Banner from "../Banner";
import { DraftRev } from "../../java2ts/DraftRev";
import { DraftPost } from "../../java2ts/DraftPost";
import { PublishResult } from "../../java2ts/PublishResult";

interface BlockWriterProps {
  initState: BlockWriterState;
}

export interface BlockWriterState {
  takeDocument: TakeDocument;
  activeBlockIndex: number;
  parentRev?: DraftRev;
  status: "INITIAL" | "SAVED" | "UNSAVED" | "ERROR";
}

class BlockWriter extends React.Component<BlockWriterProps, BlockWriterState> {
  constructor(props: BlockWriterProps) {
    super(props);

    this.state = {
      ...props.initState
    };
  }
  shouldAppendParagraph = (): boolean => {
    const blocks = this.state.takeDocument.blocks;
    const activeBlockIndex = this.state.activeBlockIndex;
    if (
      blocks[activeBlockIndex + 1] &&
      blocks[activeBlockIndex + 1].kind === "paragraph" &&
      (blocks[activeBlockIndex + 1] as ParagraphBlock).text.length === 0
    ) {
      // There is already an empty paragraph after this block
      return false;
    } else {
      return true;
    }
  };
  shouldPrependParagraph = (): boolean => {
    const blocks = this.state.takeDocument.blocks;
    const activeBlockIndex = this.state.activeBlockIndex;
    if (
      blocks[activeBlockIndex] &&
      blocks[activeBlockIndex].kind !== "paragraph"
    ) {
      // There is an evidence block immediately before this block
      return true;
    } else {
      return false;
    }
  };
  addEvidenceBlock = (newBlock: DocumentBlock | VideoBlock): void => {
    const blocks = this.state.takeDocument.blocks;
    let activeBlockIndex = this.state.activeBlockIndex;

    const emptyParagraphBlock: ParagraphBlock = {
      kind: "paragraph",
      text: ""
    };

    let newBlocks = [];

    let indexAddition = 2;

    if (this.shouldAppendParagraph() && this.shouldPrependParagraph()) {
      indexAddition = 3;
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        emptyParagraphBlock,
        newBlock,
        emptyParagraphBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    } else if (this.shouldAppendParagraph()) {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        emptyParagraphBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    } else if (this.shouldPrependParagraph()) {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        emptyParagraphBlock,
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    } else {
      indexAddition = 1;
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
    }

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks
      },
      activeBlockIndex: activeBlockIndex + indexAddition,
      status: "UNSAVED"
    });
  };
  addDocument = (
    excerptId: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ): void => {
    const newBlock: DocumentBlock = {
      kind: "document",
      excerptId: excerptId,
      highlightedRange: highlightedRange,
      viewRange: viewRange
    };

    this.addEvidenceBlock(newBlock);
  };
  addParagraph = (isTitle?: boolean): void => {
    const blocks = this.state.takeDocument.blocks;

    let activeBlockIndex = this.state.activeBlockIndex;
    let newIndex;

    const newBlock: ParagraphBlock = {
      kind: "paragraph",
      text: ""
    };

    let newBlocks = [];

    if (isTitle) {
      newBlocks = [newBlock, ...blocks.slice(0)];
      newIndex = 0;
    } else {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
      newIndex = ++activeBlockIndex;
    }

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks
      },
      activeBlockIndex: newIndex,
      status: "UNSAVED"
    });
  };
  addVideo = (id: string, range: [number, number]): void => {
    const newBlock: VideoBlock = {
      kind: "video",
      range: range,
      videoId: id
    };

    this.addEvidenceBlock(newBlock);
  };
  shouldRemoveBlock = (idx: number): boolean => {
    const blocks = this.state.takeDocument.blocks;
    if (blocks.length > 1) {
      // Don't remove the last paragraph if there is not a paragraph immediately before it
      if (
        idx === blocks.length - 1 && // Index is for the last block
        blocks[idx].kind === "paragraph" && // Last block is a paragraph
        blocks[idx - 1].kind !== "paragraph" // Next to last block is evidence
      ) {
        return false;
      }

      // Never remove a paragraph block between 2 evidence blocks
      if (blocks[idx - 1] && blocks[idx + 1]) {
        if (
          (blocks[idx - 1].kind === "document" &&
            blocks[idx + 1].kind === "document") ||
          (blocks[idx - 1].kind === "document" &&
            blocks[idx + 1].kind === "video") ||
          (blocks[idx - 1].kind === "video" &&
            blocks[idx + 1].kind === "document") ||
          (blocks[idx - 1].kind === "video" && blocks[idx + 1].kind === "video")
        ) {
          return false;
        }
      }
    }
    return true;
  };
  removeBlock = (idx: number): void => {
    const blocks = this.state.takeDocument.blocks;
    if (blocks.length > 1 && this.shouldRemoveBlock(idx)) {
      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          blocks: [...blocks.slice(0, idx), ...blocks.slice(idx + 1)]
        },
        status: "UNSAVED"
      });
    } else {
      if (blocks.length === 1 && blocks[0].kind === "document") {
        //User wants a fresh take, so give user an empty paragraph.
        this.setState({
          takeDocument: {
            ...this.state.takeDocument,
            blocks: [{ kind: "paragraph", text: "" }]
          },
          status: "UNSAVED"
        });
      }
    }
  };
  handleDeleteClick = () => {
    if (typeof this.state.parentRev != undefined && this.state.parentRev) {
      const bodyJson: DraftRev = {
        draftid: this.state.parentRev.draftid,
        lastrevid: this.state.parentRev.lastrevid
      };
      this.postRequest(
        "/drafts/delete",
        bodyJson,
        function(json: any) {
          // Not expecting a server response, so this will never execute.
        }.bind(this)
      );
    }
  };
  handlePublishClick = () => {
    const bodyJson: DraftPost = {
      parentRev: this.state.parentRev,
      title: this.state.takeDocument.title,
      blocks: this.state.takeDocument.blocks
    };
    this.postRequest(
      "/drafts/publish",
      bodyJson,
      function(json: PublishResult) {
        if (!json.conflict) {
          window.location.href = json.publishedUrl;
        } else {
          this.setState({
            status: "ERROR"
          });
        }
      }.bind(this)
    );
  };
  handleSaveClick = () => {
    //TODO: enforce title length <= 255
    const bodyJson: DraftPost = {
      parentRev: this.state.parentRev,
      title: this.state.takeDocument.title,
      blocks: this.state.takeDocument.blocks
    };
    this.postRequest(
      "/drafts/save",
      bodyJson,
      function(json: DraftRev) {
        const parentRev: DraftRev = json;
        this.setState({
          parentRev: parentRev,
          status: "SAVED"
        });
      }.bind(this)
    );
  };
  postRequest = (
    route: string,
    bodyJson: DraftPost | DraftRev,
    successCb: (json: DraftRev) => void
  ) => {
    const headers = new Headers();

    headers.append("Accept", "application/json"); // This one is enough for GET requests
    headers.append("Content-Type", "application/json"); // This one sends body

    const request: RequestInit = {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: JSON.stringify(bodyJson)
    };
    fetch(route, request)
      .then(
        function(response: Response) {
          const contentType = response.headers.get("content-type");
          if (
            contentType &&
            contentType.indexOf("application/json") >= 0 &&
            response.ok
          ) {
            return response.json();
          } else if (route === "/drafts/delete" && response.ok) {
            window.location.href = "/drafts";
          } else {
            this.setState({
              status: "ERROR"
            });
          }
        }.bind(this)
      )
      .then(
        function(json: DraftRev) {
          successCb(json);
        }.bind(this)
      )
      .catch(
        function(error: Error) {
          this.setState({
            status: "ERROR"
          });
        }.bind(this)
      );
  };
  handleTakeBlockChange = (stateIndex: number, value: string): void => {
    if (stateIndex === -1) {
      // Change the title
      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          title: value
        },
        activeBlockIndex: -1,
        status: "UNSAVED"
      });
    } else {
      const blocks = [...this.state.takeDocument.blocks];

      let valuesArr: string[] = value.split("\n");
      let newBlock: ParagraphBlock;
      let newBlocks: TakeBlock[] = [];
      let newIndex = stateIndex;

      valuesArr.forEach((element, arrIdx) => {
        if (arrIdx === 0) {
          newBlock = blocks[stateIndex] as ParagraphBlock;
          newBlock.text = element;
        } else {
          newBlock = {
            kind: "paragraph",
            text: element
          };
          newIndex++;
        }
        newBlocks = [...newBlocks, newBlock];
      });

      newBlocks = [
        ...blocks.slice(0, stateIndex),
        ...newBlocks,
        ...blocks.slice(stateIndex + 1)
      ];

      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          blocks: newBlocks
        },
        activeBlockIndex: newIndex,
        status: "UNSAVED"
      });
    }
  };
  handleTakeBlockFocus = (idx: number): void => {
    this.setActive(idx);
  };
  setActive = (idx: number): void => {
    this.setState({
      activeBlockIndex: idx
    });
  };
  render() {
    const eventHandlers = {
      handleChange: this.handleTakeBlockChange,
      handleDelete: this.removeBlock,
      handleEnterPress: this.addParagraph,
      handleFocus: this.handleTakeBlockFocus
    };

    const setFactHandlers = {
      handleDocumentSetClick: this.addDocument,
      handleVideoSetClick: this.addVideo
    };

    let deleteButton = (
      <button
        className="editor__button editor__button--delete"
        onClick={this.handleDeleteClick}
      >
        Delete Draft
      </button>
    );

    let publishButton = (
      <button
        className="editor__button editor__button--publish"
        onClick={this.handlePublishClick}
      >
        Save &amp; Publish
      </button>
    );

    let saveButton = (
      <button
        className="editor__button editor__button--save"
        onClick={this.handleSaveClick}
      >
        Save
      </button>
    );

    let disabledSaveButton = (
      <button className="editor__button editor__button--disabled" disabled>
        Save
      </button>
    );

    let metaBlock;
    switch (this.state.status) {
      case "INITIAL":
        metaBlock = (
          <div className="editor__meta">
            <Banner />
            {disabledSaveButton}
            {publishButton}
            {deleteButton}
          </div>
        );
        break;
      case "SAVED":
        metaBlock = (
          <div className="editor__meta">
            <Banner isSuccess={true}>Save successful!</Banner>
            {disabledSaveButton}
            {publishButton}
            {deleteButton}
          </div>
        );
        break;
      case "UNSAVED":
        metaBlock = (
          <div className="editor__meta">
            <Banner />
            {saveButton}
            {publishButton}
            {deleteButton}
          </div>
        );
        break;
      case "ERROR":
        metaBlock = (
          <div className="editor__meta">
            <Banner isSuccess={false}>
              There was an error saving your take.
            </Banner>
            {saveButton}
            {publishButton}
            {deleteButton}
          </div>
        );
        break;
      default:
        metaBlock = null;
    }

    return (
      <div>
        <BlockEditor
          eventHandlers={eventHandlers}
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          active={this.state.activeBlockIndex}
        />
        <div className="editor__wrapper">
          {metaBlock}
          <p className="timeline__instructions">
            Add Facts to your Take from the timeline below.
          </p>
        </div>
        <TimelineView setFactHandlers={setFactHandlers} />
      </div>
    );
  }
}

export default BlockWriter;
