import { BlockWriterState } from "../../components/BlockWriter";

let initialState: BlockWriterState = {
  takeDocument: {
    title: "",
    blocks: [{ kind: "paragraph", text: "" }]
  },
  activeBlockIndex: -1
};

export default { initialState };
