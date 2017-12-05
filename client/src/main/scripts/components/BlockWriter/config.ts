import { InitialBlockWriterState } from "../../components/BlockWriter";

let initialState: InitialBlockWriterState = {
  takeDocument: {
    title: "",
    blocks: [{ kind: "paragraph", text: "" }]
  },
  activeBlockIndex: -1
};

export default { initialState };
