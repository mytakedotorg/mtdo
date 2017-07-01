import * as React from "react";
var htmlparser = require('htmlparser2');

/**
 *  Create an array of React elements for each Node in a given HTML string.
 * 
 *  Assumes no child nodes in HTML string input.
 */
  
export default function getNodeArray(source : string): Array<MyReactComponentObject> {
  let output: Array<MyReactComponentObject> = [];
  let tagIsOpen: boolean = false;
  let newElementName: string;
  let newElementProps: MyComponentPropsObject;
  let newElemenetText: string;
  let iter = 0;

  var parser = new htmlparser.Parser({
    onopentag: function(name: string, attributes: MyComponentPropsObject) {    
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
