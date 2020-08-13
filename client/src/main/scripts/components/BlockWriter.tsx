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
import * as React from "react";
import { FoundationFetcher } from "../common/foundation";
import { DraftPost } from "../java2ts/DraftPost";
import { DraftRev } from "../java2ts/DraftRev";
import { PublishResult } from "../java2ts/PublishResult";
import { Routes } from "../java2ts/Routes";
import { post } from "../network";
import { slugify } from "../utils/functions";
import BlockEditor, {
  DocumentBlock,
  ParagraphBlock,
  TakeBlock,
  TakeDocument,
  VideoBlock,
} from "./BlockEditor";
import EditorButtons from "./EditorButtons";
import TimelineLoader from "./TimelineLoader";

interface BlockWriterProps {
  initState: InitialBlockWriterState;
  hashUrl?: string;
}

export interface InitialBlockWriterState {
  takeDocument: TakeDocument;
  activeBlockIndex: number;
  parentRev?: DraftRev;
}

interface BlockWriterHashValues {
  factHash: string;
  highlightedRange: [number, number];
  viewRange: [number, number] | null;
  articleUser: string | null;
  articleTitle: string | null;
}

export interface Status {
  saved: boolean;
  saving: boolean;
  error: boolean;
  message: string;
}

interface BlockWriterState {
  takeDocument: TakeDocument;
  activeBlockIndex: number;
  parentRev?: DraftRev;
  status: Status;
}

export interface ButtonEventHandlers {
  handleDeleteClick: () => void;
  handlePublishClick: () => void;
  handleSaveClick: () => void;
}

export const initialState: InitialBlockWriterState = {
  takeDocument: {
    title: "",
    blocks: [{ kind: "paragraph", text: "" }],
  },
  activeBlockIndex: -1,
};

class BlockWriter extends React.Component<BlockWriterProps, BlockWriterState> {
  constructor(props: BlockWriterProps) {
    super(props);

    let blocks = props.initState.takeDocument.blocks.map(
      (block: TakeBlock, index: number) => {
        return (Object as any).assign({}, block);
      }
    );

    const takeDocument = {
      title: props.initState.takeDocument.title,
      blocks: blocks,
    };

    const initialStatus = {
      saved: true,
      saving: false,
      error: false,
      message: "",
    };

    if (props.initState.parentRev) {
      this.state = {
        takeDocument: takeDocument,
        activeBlockIndex: props.initState.activeBlockIndex,
        parentRev: {
          ...props.initState.parentRev,
        },
        status: initialStatus,
      };
    } else {
      this.state = {
        takeDocument: takeDocument,
        activeBlockIndex: props.initState.activeBlockIndex,
        status: initialStatus,
      };
    }
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
      text: "",
    };

    let newBlocks: TakeBlock[];
    let indexAddition = 2;

    if (this.shouldAppendParagraph() && this.shouldPrependParagraph()) {
      indexAddition = 3;
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        emptyParagraphBlock,
        newBlock,
        emptyParagraphBlock,
        ...blocks.slice(activeBlockIndex + 1),
      ];
    } else if (this.shouldAppendParagraph()) {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        emptyParagraphBlock,
        ...blocks.slice(activeBlockIndex + 1),
      ];
    } else if (this.shouldPrependParagraph()) {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        emptyParagraphBlock,
        newBlock,
        ...blocks.slice(activeBlockIndex + 1),
      ];
    } else {
      indexAddition = 1;
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1),
      ];
    }

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks,
      },
      activeBlockIndex: activeBlockIndex + indexAddition,
      status: {
        ...this.state.status,
        saved: false,
        error: false,
        message: "",
      },
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
      viewRange: viewRange,
    };

    this.addEvidenceBlock(newBlock);
  };
  addParagraph = (isTitle?: boolean): void => {
    const blocks = this.state.takeDocument.blocks;

    let activeBlockIndex = this.state.activeBlockIndex;
    let newIndex;

    const newBlock: ParagraphBlock = {
      kind: "paragraph",
      text: "",
    };

    let newBlocks: TakeBlock[];
    if (isTitle) {
      newBlocks = [newBlock, ...blocks.slice(0)];
      newIndex = 0;
    } else {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1),
      ];
      newIndex = ++activeBlockIndex;
    }

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks,
      },
      activeBlockIndex: newIndex,
      status: {
        ...this.state.status,
        saved: false,
        error: false,
        message: "",
      },
    });
  };
  addVideo = (id: string, range: [number, number]): void => {
    const newBlock: VideoBlock = {
      kind: "video",
      range: range,
      videoId: id,
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
          blocks: [...blocks.slice(0, idx), ...blocks.slice(idx + 1)],
        },
        status: {
          ...this.state.status,
          saved: false,
          error: false,
          message: "",
        },
      });
    } else {
      if (blocks.length === 1 && blocks[0].kind === "document") {
        //User wants a fresh take, so give user an empty paragraph.
        this.setState({
          takeDocument: {
            ...this.state.takeDocument,
            blocks: [{ kind: "paragraph", text: "" }],
          },
          status: {
            ...this.state.status,
            saved: false,
            error: false,
            message: "",
          },
        });
      }
    }
  };
  handleDeleteClick = () => {
    if (
      confirm(
        "This action cannot be undone. Are you sure you want to delete this draft?"
      )
    ) {
      if (typeof this.state.parentRev != undefined && this.state.parentRev) {
        // Draft has been saved
        post<DraftRev, void>(Routes.DRAFTS_DELETE, {
          draftid: this.state.parentRev.draftid,
          lastrevid: this.state.parentRev.lastrevid,
        });
      } else {
        // Draft is unsaved, server doesn't know about it.
        window.location.href = Routes.DRAFTS;
      }
    }
  };
  handlePublishClick = async () => {
    if (
      confirm(
        "This action cannot be undone. Are you sure you want to publish this draft?"
      )
    ) {
      const { title } = this.state.takeDocument;
      if (title.length <= 255) {
        if (title.length > 0) {
          this.setState({
            status: {
              ...this.state.status,
              saving: true,
              error: false,
              message: "Publishing Take.",
            },
          });
          const draftPost: DraftPost = {
            parentRev: this.state.parentRev,
            title: this.state.takeDocument.title,
            blocks: this.state.takeDocument.blocks,
            imageUrl: "",
          };
          const firstFact = getFirstFactBlock(this.state.takeDocument.blocks);
          let imageUrl: string;
          if (firstFact) {
            if (firstFact.kind === "document") {
              const fact = await FoundationFetcher.justOneDocument(
                firstFact.excerptId
              );
              const hRange = firstFact.highlightedRange;
              const vRange = firstFact.viewRange;
              draftPost.imageUrl = `/${slugify(fact.fact.title)}_${hRange[0]}-${
                hRange[1]
              }_${vRange[0]}-${vRange[1]}.png`;
              this.publishTake(draftPost);
            } else if (firstFact.kind === "video") {
              const fact = await FoundationFetcher.justOneDocument(
                firstFact.videoId
              );
              const rangeUrl = firstFact.range
                ? `_${firstFact.range[0]}-${firstFact.range[1]}`
                : "";
              draftPost.imageUrl = `/${slugify(
                fact.fact.title
              )}${rangeUrl}.png`;
              this.publishTake(draftPost);
            } else {
              throw "BlockWriter: Expected block to be either a document or a video";
            }
          } else {
            // bodyJson.imageUrl is "" here
            this.publishTake(draftPost);
          }
        } else {
          this.setState({
            status: {
              ...this.state.status,
              error: true,
              message: "Take must have a title.",
            },
          });
        }
      } else {
        this.setState({
          status: {
            ...this.state.status,
            error: true,
            message: "Title cannot be longer than 255 characters.",
          },
        });
      }
    }
  };
  getImageUrl = () => {};
  handleSaveClick = async () => {
    const { title } = this.state.takeDocument;
    if (title.length <= 255) {
      if (title.length > 0) {
        this.setState({
          status: {
            ...this.state.status,
            saving: true,
            error: false,
            message: "Saving Take.",
          },
        });
        const parentRev = await post<DraftPost, DraftRev>(Routes.DRAFTS_SAVE, {
          parentRev: this.state.parentRev,
          title: title,
          blocks: this.state.takeDocument.blocks,
          imageUrl: "",
        });
        this.setState({
          parentRev: parentRev,
          status: {
            saved: true,
            saving: false,
            error: false,
            message: "Save successful!",
          },
        });
      } else {
        this.setState({
          status: {
            ...this.state.status,
            error: true,
            message: "Take must have a title.",
          },
        });
      }
    } else {
      this.setState({
        status: {
          ...this.state.status,
          error: true,
          message: "Title cannot be longer than 255 characters.",
        },
      });
    }
  };
  parseHashURL = (hash: string): BlockWriterHashValues => {
    // Expect hash URL to be like, #{FoundationType}&{highlightRangeStart}&{highlightRangeEnd}&{viewRangeStart}&{viewRangeEnd}&{URL of Take being read}
    // localhost:3000/drafts/new/#LWbZHJ0sfeTMwVNXfB44e7Vn7QRilZkbh7aEYjMFLEA=&369&514&369&514&/samples/does-a-law-mean-what-it-says-or-what-it-meant/
    const hashArr = hash.substring(1).split("&");
    const factHash = hashArr[0];

    const regex = /^[A-Za-z0-9\-\=\/\+\_]+$/; //URL encoded base 64

    if (factHash.length != 44 || !regex.test(factHash)) {
      throw "BlockWriter: Invalid fact hash in hash URL";
    }

    const highlightedRange: [number, number] = [
      parseFloat(hashArr[1]),
      parseFloat(hashArr[2]),
    ];

    let articleUser;
    let articleTitle;
    let viewRange: [number, number] | null;

    if (hashArr[3] && hashArr[3].indexOf("/") > -1) {
      articleUser = hashArr[3].split("/")[1];
      articleTitle = hashArr[3].split("/")[2];
      viewRange = null;
    } else {
      if (hashArr[3] && hashArr[4]) {
        viewRange = [parseInt(hashArr[3]), parseInt(hashArr[4])];
      } else {
        viewRange = null;
      }

      if (hashArr[5]) {
        articleUser = hashArr[5].split("/")[1];
        articleTitle = hashArr[5].split("/")[2];
      } else {
        articleUser = null;
        articleTitle = null;
      }
    }

    return {
      factHash,
      articleUser,
      articleTitle,
      highlightedRange,
      viewRange,
    };
  };
  publishTake = async (draftPost: DraftPost) => {
    const publish = await post<DraftPost, PublishResult>(
      Routes.DRAFTS_PUBLISH,
      draftPost
    );
    if (!publish.conflict) {
      window.location.href = publish.publishedUrl;
    } else {
      throw "There was an error publishing your Take.";
    }
  };
  handleTakeBlockChange = (stateIndex: number, value: string): void => {
    if (stateIndex === -1) {
      // Change the title
      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          title: value,
        },
        activeBlockIndex: -1,
        status: {
          ...this.state.status,
          saved: false,
          error: false,
          message: "",
        },
      });
    } else {
      const blocks = [...this.state.takeDocument.blocks];

      let valuesArr: string[] = value.split("\n");
      let newBlock: ParagraphBlock;
      let newBlocks: TakeBlock[] = [];
      let newIndex = stateIndex;

      valuesArr.forEach((element, arrIdx) => {
        if (arrIdx === 0) {
          newBlock = (Object as any).assign(
            {},
            blocks[stateIndex]
          ) as ParagraphBlock;
          newBlock.text = element;
        } else {
          newBlock = {
            kind: "paragraph",
            text: element,
          };
          newIndex++;
        }
        newBlocks = [...newBlocks, newBlock];
      });

      newBlocks = [
        ...blocks.slice(0, stateIndex),
        ...newBlocks,
        ...blocks.slice(stateIndex + 1),
      ];

      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          blocks: newBlocks,
        },
        activeBlockIndex: newIndex,
        status: {
          ...this.state.status,
          saved: false,
          error: false,
          message: "",
        },
      });
    }
  };
  handleTakeBlockFocus = (idx: number): void => {
    this.setActive(idx);
  };
  setActive = (idx: number): void => {
    this.setState({
      activeBlockIndex: idx,
    });
  };
  componentDidMount() {
    if (this.props.hashUrl) {
      try {
        const hashParams: BlockWriterHashValues = this.parseHashURL(
          this.props.hashUrl
        );
        if (hashParams.viewRange) {
          this.addDocument(
            hashParams.factHash,
            hashParams.highlightedRange,
            hashParams.viewRange
          );
        } else {
          this.addVideo(hashParams.factHash, hashParams.highlightedRange);
        }
      } catch (e) {
        // Couldn't parse hash URL, clear it
        window.location.hash = "";
      }
    }
  }
  render() {
    const editorEventHandlers = {
      handleChange: this.handleTakeBlockChange,
      handleDelete: this.removeBlock,
      handleEnterPress: this.addParagraph,
      handleFocus: this.handleTakeBlockFocus,
    };

    const setFactHandlers = {
      handleDocumentSetClick: this.addDocument,
      handleVideoSetClick: this.addVideo,
      handleRangeSet: () => {},
      handleRangeCleared: () => {},
    };

    const buttonEventHandlers: ButtonEventHandlers = {
      handleDeleteClick: this.handleDeleteClick,
      handlePublishClick: this.handlePublishClick,
      handleSaveClick: this.handleSaveClick,
    };
    return (
      <div>
        <BlockEditor
          eventHandlers={editorEventHandlers}
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          active={this.state.activeBlockIndex}
        />
        <div className="editor__wrapper">
          <div className="editor__row">
            <EditorButtons
              eventHandlers={buttonEventHandlers}
              status={this.state.status}
            />
          </div>
          <p className="timeline__instructions">
            Add Facts to your Take from the timeline below.
          </p>
        </div>
        <TimelineLoader
          path={window.location.pathname}
          setFactHandlers={setFactHandlers}
        />
      </div>
    );
  }
}

function getFirstFactBlock(
  blockList: TakeBlock[]
): VideoBlock | DocumentBlock | null {
  for (let block of blockList) {
    if (block.kind === "document" || block.kind === "video") {
      return block;
    }
  }
  return null;
}

export default BlockWriter;
