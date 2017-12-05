/* Generated from Java with JSweet 2.0.1 - http://www.jsweet.org */
export interface Foundation {}

export namespace Foundation {

    export interface Fact {
        title : string;

        primaryDate : string;

        primaryDateKind : string;

        kind : string;
    }

    export interface FactLink {
        fact : Foundation.Fact;

        hash : string;
    }

    export interface FactContent {
        fact : Foundation.Fact;
    }

    export interface DocumentComponent {
        component : string;

        innerHTML : string;

        offset : number;
    }

    export interface DocumentFact {
        title : string;

        filename : string;

        primaryDate : Date;

        primaryDateKind : string;
    }

    export interface VideoFact {
        id : string;

        title : string;

        primaryDate : Date;

        primaryDateKind : "recorded";
    }

    export interface Person {
        firstname : string;

        middlename? : string;

        lastname : string;
    }

    export interface SpeakerMap {
        speaker : string;

        range : [number,number];
    }

    export interface CaptionWord {
        idx : number;

        word : string;

        timestamp : number;
    }

    export interface CaptionMeta {
        speakers : Array<Foundation.Person>;

        speakerMap : Array<Foundation.SpeakerMap>;
    }

    export interface VideoFactContent extends Foundation.FactContent {
        youtubeId : string;

        speakers? : Array<Foundation.Person>;

        transcript? : Array<Foundation.CaptionWord>;

        speakerMap? : Array<Foundation.SpeakerMap>;
    }

    export interface VideoFactContentFast extends Foundation.FactContent {
        youtubeId : string;

        speakers : Array<Foundation.Person>;

        plainText : string;

        /**
         * Word n starts at charOffsets[n].
         */
        charOffsets : ArrayLike<number>;

        /**
         * Word n is spoken at timestamps[n].
         */
        timestamps : ArrayLike<number>;

        /**
         * speakers[speakerPerson[0]] = the first person who speaks.
         * speakers[speakerPerson[1]] = the second person who speaks.
         */
        speakerPerson : ArrayLike<number>;

        /**
         * charOffsets[speakerWord[0]] = the character offset where the first person starts
         * charOffsets[charOffsets[1]] = the character offset where the second person starts
         */
        speakerWord : ArrayLike<number>;
    }

    export interface VideoFactContentEncoded extends Foundation.FactContent {
        youtubeId : string;

        speakers : Array<Foundation.Person>;

        plainText : string;

        /**
         * Count of the words.
         */
        numWords : number;

        numSpeakerSections : number;

        /**
         * [charOffsets, timestamps, speakerPerson, speakerWord], little-endian Base64 encoded.
         */
        data : string;
    }

    export interface DocumentFactContent extends Foundation.FactContent {
        components : Array<Foundation.DocumentComponent>;
    }
}



