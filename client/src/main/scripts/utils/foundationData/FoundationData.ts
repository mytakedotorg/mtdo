import { Foundation } from "../../java2ts/Foundation";
import { isDocument, isVideo } from "../../utils/databaseAPI";

export class FoundationData {
  constructor(
    private hashToContent: Map<
      string,
      Foundation.VideoFactContent | Foundation.DocumentFactContent
    >
  ) {}

  getDocument = (hash: string): Foundation.DocumentFactContent => {
    const content = this.hashToContent.get(hash);
    if (isDocument(content)) {
      return content;
    }
    throw `Content of hash ${hash} is not a document.`;
  };

  getVideo = (hash: string): Foundation.VideoFactContent => {
    const content = this.hashToContent.get(hash);
    if (isVideo(content)) {
      return content;
    }
    throw `Content of hash ${hash} is not a video.`;
  };
}
