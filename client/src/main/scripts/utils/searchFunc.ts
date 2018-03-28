import { Search } from "../java2ts/Search";

/**
 * Offsets to cut out of the turn content, along with all the offsets
 * to highlight within that content.  The highlights are relative to
 * the start of the turn's content, not the start of the cut.
 */
interface MultiHighlight {
    cut: [number, number]
    highlights: Array<[number, number]>;
}

/** This class finds matches within a turn, returning them as TurnWithResults. */
class TurnFinder {
    regex: RegExp;

    constructor(searchTerm: string) {
        // i = ignore case
        // '\W+' means that all commas, dashes, quotes, etc. get smushed into one group
        this.regex = new RegExp(searchTerm.replace(' ', '\W+'), 'i')
    }

    /** Finds all the results in the given turnContent. */
    findResults(turnContent: string): TurnWithResults {
        this.regex.lastIndex = 0;
        let foundOffsets: Array<[number, number]> = [];    
        let found = this.regex.exec(turnContent);
        while (found != null) {
            const lastIndex = found.index + found[0].length;
            foundOffsets.push([found.index, lastIndex]);
            this.regex.lastIndex = lastIndex + 1;
            found = this.regex.exec(turnContent);
        }
        return new TurnWithResults(turnContent, foundOffsets);
    }
}

/**
 * Contains the offsets of every word that was found.
 * Use "expandBy" to find the MultiHighlight that would
 * contain more sentences.
 */
class TurnWithResults {
    turnContent: string
    foundOffsets: Array<[number, number]>;

    constructor(turnContent: string, foundOffsets: Array<[number, number]>) {
        this.turnContent = turnContent;
        this.foundOffsets = foundOffsets;
    }

    /** Returns the MultiHighlights with the given amount of padding around the found words. */
    expandBy(numSentences: number) : MultiHighlight[] {
        let multiHighlights: MultiHighlight[] = [];

        let expanded: Array<[number, number]> = [];
        for (var found of this.foundOffsets) {
            // initialize around the found word
            let start = this.prevPunc(found[0]);
            let end = this.nextPunc(found[1]);
            // expand a few more times
            for (var i = 1; i < numSentences; ++i) {
                start = this.prevPunc(start - 5);
                end = this.nextPunc(end + 5);
            }
            // if we overlap with the previous highlight, expand it to include our stuff
            let lastHighlight = multiHighlights.length == 0 ? null : multiHighlights[multiHighlights.length - 1];
            if (lastHighlight != null && lastHighlight.cut[1] >= start) {
                lastHighlight.cut[1] = end;
                lastHighlight.highlights.push(found);
            } else {
                // else create a new highlight
                multiHighlights.push({
                    cut: [start, end],
                    highlights: [found]
                });
            }
        }
        return multiHighlights;
    }

    /** 
     * Returns the beginning of the sentence, e.g.
     *           v if searching for she
     * "Hello!", she said.
     *    Hello. That's what she said.
     */
    prevPunc(start: number): number {
        if (start <= 0) {
            return 0;
        }
        let prevPeriod = this.turnContent.lastIndexOf('.', start);
        let prevQuestion = this.turnContent.lastIndexOf('?', start);
        let prevExclamation = this.turnContent.lastIndexOf('!', start);
        let firstPrev = Math.max(prevPeriod, Math.max(prevQuestion, prevExclamation));
        if (firstPrev == -1) {
            return 0;
        } else {
            // Expand to end of quote for e.g. "Hello!", she said.
            // searching for "she", we want to point to the "s" in she
            let firstSpaceAfterPrev = this.turnContent.indexOf(' ', firstPrev);
            return firstSpaceAfterPrev + 1;
        }
    }

    /**
     * Returns the end of the sentence, e.g.
     *                       v if searching for "hello"
     *              "Hello!", she said.
     *                 Hello. That's what she said.
     *                 Hello!
     */
    nextPunc(start: number): number {
        if (start >= this.turnContent.length) {
            return this.turnContent.length;
        }
        var negativeToMax = (num: number) => num == -1 ? this.turnContent.length : num;
        let nextPeriod = negativeToMax(this.turnContent.indexOf('.', start));
        let nextQuestion = negativeToMax(this.turnContent.indexOf('?', start));
        let nextExclamation = negativeToMax(this.turnContent.indexOf('!', start));
        let firstNext = Math.min(nextPeriod, Math.min(nextQuestion, nextExclamation));
        // if none are found, then we'll return turnContent.length, which is perfect
        if (firstNext == this.turnContent.length) {
            return this.turnContent.length;
        } else {
            // expand to end of quote for e.g. "Hello!", she said.
            let firstSpace = this.turnContent.indexOf(' ', firstNext);
            if (firstSpace == -1) {
                return this.turnContent.length;
            } else {
                return firstSpace;
            }
        }
    }
}
