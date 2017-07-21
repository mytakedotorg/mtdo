import * as React from "react";
import { FoundationNode, FoundationNodeProps } from '../components/Foundation';
var htmlparser = require('htmlparser2');

/**
 *  Create an array of React elements for each Node in a given HTML string.
 * 
 *  Assumes no child nodes in HTML string input.
 */
  
export default function getNodeArray(source : string): Array<FoundationNode> {
  let output: Array<FoundationNode> = [];
  let tagIsOpen: boolean = false;
  let newElementName: string;
  let newElementProps: FoundationNodeProps;
  let newElemenetText: string;
  let iter = 0;

  var parser = new htmlparser.Parser({
    onopentag: function(name: string, attributes: FoundationNodeProps) {    
      tagIsOpen = true;
			newElementName = name;
			newElementProps = attributes;
    },
    ontext: function(text: string) {
      if ( tagIsOpen ) {
        newElemenetText = text;
      }
      // Ignore text between tags, usually this is just a blank space
    },
    onclosetag: function(name: string) {
      tagIsOpen = false;
      output.push({
        component: newElementName,
        props: newElementProps,
        innerHTML: [newElemenetText]
      });
    },
    onerror: function(error: Error) {
      throw error;
    }
  })

  parser.write(source);
  parser.end();
  
  return output;
}
