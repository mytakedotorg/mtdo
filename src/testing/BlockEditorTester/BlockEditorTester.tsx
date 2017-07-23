import * as React from "react";
import BlockEditor, { ParagraphBlock, TakeDocument } from '../../components/BlockEditor';

interface BlockEditorTesterProps {

}

interface BlockEditorTesterState {
  takeDocument: TakeDocument,
	activeBlockIndex: number
}


class BlockEditorTester extends React.Component<BlockEditorTesterProps, BlockEditorTesterState> {
  constructor(props: BlockEditorTesterProps){
    super(props);

    this.state = {
      takeDocument: {
				title: 'My Title',
        blocks: [
					{ kind: 'paragraph', text: 'Use your voice here.' },
					{ kind: 'document', document: 'AMENDMENTS', range: [369, 514] },
				]
			},
			activeBlockIndex: -1,
    }
	}
	addParagraph = (): void => {
		const blocks = this.state.takeDocument.blocks;
		let activeBlockIndex = this.state.activeBlockIndex;

		const newBlock: ParagraphBlock = {
			kind: 'paragraph',
			text: 'new block'
		}

		const newBlocks = [
			...blocks.slice(0, activeBlockIndex + 1),
			newBlock,
			...blocks.slice(activeBlockIndex + 1)
		];
		
		this.setState({
			takeDocument: {
				...this.state.takeDocument,
				blocks: newBlocks
			},
			activeBlockIndex: ++activeBlockIndex
		});
	}
	removeParagraph = (id: number): void =>{
		const blocks = this.state.takeDocument.blocks;
		if (blocks.length > 1 ) {
			this.setState({
				takeDocument:{
					...this.state.takeDocument,
					blocks: [
						...blocks.slice(0, id),
						...blocks.slice(id + 1)
					]
				}
			})
		} else {
			if (blocks[0].kind === 'document'){
				//User wants a fresh take, so give user an empty paragraph.
				this.setState({
					takeDocument:{
						...this.state.takeDocument,
						blocks: [
							{ kind: 'paragraph', text: '' }
						]
					}
				});
			}
		}
	}
	handleTakeBlockChange = (id: number, value: string): void => { 
		const blocks = this.state.takeDocument.blocks;
		
		const newBlock = blocks[id] as ParagraphBlock;
		newBlock.text = value;
		
		const newBlocks = [
			...blocks.slice(0, id),
			newBlock,
			...blocks.slice(id + 1)
		];
		
		this.setState({
			takeDocument: {
				...this.state.takeDocument,
				blocks: newBlocks
			}
		});
	}
	handleTakeBlockFocus = (id: number): void  => {
		this.setActive(id);
	}
	setActive = (id: number): void => {
		this.setState({
			activeBlockIndex: id
		});
	}
  render(){
    return (
      <div>
        <BlockEditor 
					handleDelete={this.removeParagraph}
					handleChange={this.handleTakeBlockChange}
					handleFocus={this.handleTakeBlockFocus}
					handleEnter={this.addParagraph}
					takeDocument={this.state.takeDocument}
					active={this.state.activeBlockIndex}
        />
      </div>
    )
  }
}


export default BlockEditorTester;
