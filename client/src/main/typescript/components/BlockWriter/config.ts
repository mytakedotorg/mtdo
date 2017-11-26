import { BlockWriterState } from "../../components/BlockWriter";

let initialState: BlockWriterState = {
  takeDocument: {
    title: "",
    blocks: [{ kind: "paragraph", text: "" }]
  },
  activeBlockIndex: -1,
  status: "INITIAL"
};

export default { initialState };
