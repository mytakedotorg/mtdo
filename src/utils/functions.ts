import * as React from "react";
import { FoundationNode, FoundationTextTypes} from '../components/Foundation';

function clearDefaultDOMSelection(): void {
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else { 
		// pre IE 9, unsupported
	}
}

function getHighlightedNodes( nodes: FoundationNode[], range: [number, number]): FoundationNode[] {
	const startRange = range[0];
	const endRange = range[1];
	let documentNodes: FoundationNode[] = [];
	let highlightedNodes: FoundationNode[] = [];
	for(let idx = 0; idx < nodes.length; idx++) {
		if (nodes[idx + 1]) {
			if (parseInt(nodes[idx + 1].props.data) < startRange) {
				continue;
			}
		}
		if (parseInt(nodes[idx].props.data) > endRange) {
			break;
		}
		documentNodes = [ 
			...documentNodes,
			...nodes.slice(idx, idx+1) ];
	}
	// documentNodes is a new array with only the nodes containing text to be highlighted
	if (documentNodes.length === 1) {
		const offset = parseInt(documentNodes[0].props.data);
		const startIndex = startRange - offset;
		const endIndex = endRange - offset;
		let newSpan: React.ReactNode = React.createElement(
			'span',
			{
				className: 'editor__document-highlight',
				key: 'somekey'
			},
			documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
		);
		let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
		const length = documentNodes[0].innerHTML.toString().length;
		newNode.innerHTML = [
			newNode.innerHTML.toString().substring(0, startIndex),
			newSpan,
			newNode.innerHTML.toString().substring(endIndex, length)
		]
		highlightedNodes = [newNode];
	} else {
		// More than one DOM node highlighted
		let offset = parseInt(documentNodes[0].props.data);
		let length = documentNodes[0].innerHTML.toString().length;
		let startIndex = startRange - offset;
		let endIndex = length;

		let newSpan: React.ReactNode = React.createElement(
			'span',
			{
				className: 'editor__document-highlight',
				key: 'somekey'
			},
			documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
		);

		let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
		newNode.innerHTML = [
			newNode.innerHTML.toString().substring(0, startIndex),
			newSpan
		]

		highlightedNodes = [newNode];
		
		for (let index: number = 1; index < documentNodes.length; index++) {
			offset = parseInt(documentNodes[index].props.data);
			length = documentNodes[index].innerHTML.toString().length;
			startIndex = 0;
			
			if (documentNodes[index+1]) {
				// The selection continues beyond this one
				endIndex = length;
			} else {
				// This is the final node in the selection
				endIndex = endRange - offset;
			}

			let newSpan: React.ReactNode = React.createElement(
				'span',
				{
					className: 'editor__document-highlight',
					key: 'somekey'
				},
				documentNodes[index].innerHTML.toString().substring(startIndex, endIndex)
			);

			let newNode: FoundationNode = (Object as any).assign({}, documentNodes[index]);
			newNode.innerHTML = [
				newSpan, 
				newNode.innerHTML.toString().substring(endIndex, length),
			]

			highlightedNodes = [
				...highlightedNodes,
				newNode
			];
		}
	}
	return highlightedNodes;
}

interface HighlightedText {
	newNodes: FoundationNode[];
	range: [number, number];
}

function highlightText(range: Range, nodes: FoundationNode[], type: FoundationTextTypes, childNodes: NodeList, handleSetClick: ()=> void): HighlightedText {
	let firstIndexClassName = 'constitution__row';
	let secondIndexClassName = 'constitution__text';
	let foundationClassName = 'constitution__text--selected';

	switch (type) {
		case 'AMENDMENTS':
			firstIndexClassName = 'amendments__row';
			secondIndexClassName = 'amendments__text';
			foundationClassName = "amendments__text--selected";
			break;
		case 'CONSTITUTION':
			firstIndexClassName = 'constitution__row';
			secondIndexClassName = 'constitution__text';
			foundationClassName = "constitution__text--selected";
			break;
		default:
			break;
	}

	const indexOfStartContainer: number = Array.prototype.indexOf.call(
		range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
		range.startContainer.parentNode);                         //Find indexOf current Node
	
	const indexOfSelectionStart: number = range.startOffset;
		
	const indexOfEndContainer: number = Array.prototype.indexOf.call(
		range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
		range.endContainer.parentNode);                        //Find indexOf current Node

	const indexOfSelectionEnd: number = range.endOffset;

	let foundationIndex;
	let firstNodeList = childNodes;
	for(let i=0; i < firstNodeList.length; i++){
		for(let j=0; j < firstNodeList[i].attributes.length; j++){
			if(firstNodeList[i].attributes.item(j).value == firstIndexClassName){
				foundationIndex = i;
				break;
			}
		}
		if(foundationIndex !== undefined){
			break;
		}
	}

	let secondIndex;  //constitution | amendments
	let secondNodeList = firstNodeList[foundationIndex].childNodes;
	for(let i=0; i < secondNodeList.length; i++){
		for(let j=0; j < secondNodeList[i].attributes.length; j++){
			if(secondNodeList[i].attributes.item(j).value == secondIndexClassName){
				secondIndex = i;
				break;
			}
		}
		if(secondIndex !== undefined){
			break;
		}
	}
	
	const startContainer: Node = firstNodeList[foundationIndex]
		.childNodes[secondIndex]
		.childNodes[indexOfStartContainer];
	const endContainer: Node = firstNodeList[foundationIndex]
		.childNodes[secondIndex]
		.childNodes[indexOfEndContainer];

	let newNodes: Array<FoundationNode> = [...nodes.slice(0, indexOfStartContainer)];

	if (startContainer === endContainer) {
		// Create a new Span element with the contents of the highlighted text
		let newSpan: React.ReactNode = React.createElement(
			'span', 
			{
				className: foundationClassName, 
				key: 'someKey',
				onClick: handleSetClick
			}, 
			startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
		);

		// Modify state array immutably
		let newNode: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
		newNode.innerHTML = [
			startContainer.textContent.substring(0, indexOfSelectionStart),
			newSpan,
			startContainer.textContent.substring(indexOfSelectionEnd, startContainer.textContent.length)
		];

		newNodes = [
			...newNodes,
			newNode
		];
	} else {
		// Create a new Span element with the contents of the highlighted text
		let firstNewSpan: React.ReactNode = React.createElement(
			'span', 
			{
				className: foundationClassName, 
				key: 'someKey',
				onClick: handleSetClick
			}, 
			startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
		);
		
		// Modify state array immutably
		let firstNewNode: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
		firstNewNode.innerHTML = [
			startContainer.textContent.substring(0, indexOfSelectionStart),
			firstNewSpan
		];
		
		newNodes = [
			...newNodes,
			firstNewNode
		];

		for(let index: number = indexOfStartContainer + 1; index < indexOfEndContainer ; index++){
			let nextNewNode: FoundationNode = (Object as any).assign({}, nodes[index]);
			let nextNewSpan: React.ReactNode = React.createElement(
				'span',
				{
					className: foundationClassName, 
					key: 'someKey',
					onClick: handleSetClick
				},
				nextNewNode.innerHTML
			)
			nextNewNode.innerHTML = [nextNewSpan];

			newNodes = [
				...newNodes,
				nextNewNode
			];
		}    

		// Create a new Span element with the contents of the highlighted text
		let lastNewSpan: React.ReactNode = React.createElement(
			'span', 
			{
				className: foundationClassName, 
				key: 'someKey',
				onClick: handleSetClick
			}, 
			endContainer.textContent.substring(0, indexOfSelectionEnd)
		);
		// Modify state array immutably
		let lastNewNode: FoundationNode = (Object as any).assign({}, nodes[indexOfEndContainer]);
		lastNewNode.innerHTML = [
			lastNewSpan,
			endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
		];

		newNodes = [
			...newNodes,
			lastNewNode
		];
	
	}
	
	newNodes = [
		...newNodes,
		...nodes.slice(indexOfEndContainer + 1, nodes.length)
	]
	
	clearDefaultDOMSelection();
	
	const rangeStart = parseInt(startContainer.attributes[0].value) + indexOfSelectionStart;
	const rangeEnd = parseInt(endContainer.attributes[0].value) + indexOfSelectionEnd;
	
	return {
		newNodes: newNodes,
		range: [rangeStart, rangeEnd]
	}
}

export { clearDefaultDOMSelection, getHighlightedNodes, highlightText, HighlightedText };

export default {}
