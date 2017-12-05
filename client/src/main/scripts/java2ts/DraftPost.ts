/* Generated from Java with JSweet 2.0.1 - http://www.jsweet.org */
import { Json } from './Json';
import { DraftRev } from './DraftRev';

export interface DraftPost extends Json {
    parentRev? : DraftRev;

    title : string;

    blocks : any;
}


