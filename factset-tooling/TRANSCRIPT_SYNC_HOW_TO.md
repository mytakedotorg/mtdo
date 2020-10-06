# How to sync a transcript

## Deprecated - has been moved to a new plugin, these docs have not been updated yet

When you upload a video to YouTube, YouTube will automatically create a millisecond-accurate transcript of the content.  As of March 2020, you can see this at `studio.youtube.com`:

![How to get transcripts from YouTube](TRANSCRIPT_HOW_TO_youtube.png)

It takes a few hours for this transcript to become available.  So far as I know, there isn't any way to track when it will come.  You can download this transcript, but it comes as an `.sbv` file, not a `.vtt` file.  The `.sbv` file is bad, because it doesn't tell you when each word is said, just each "line".  But if you click the vertical ellipsis, and then `Edit on Classic Studio` then you can click `Actions -> Download -> .vtt`.  The `.vtt` is what you want, because it has timestamps for every single word.  You download it to the [`presidential-debates`](https://github.com/mytakedotorg/mtdo/tree/staging/presidential-debates) folder, and then run [`VttCleanup`](https://github.com/mytakedotorg/mtdo/blob/staging/foundation-gen/src/test/java/org/mytake/foundation/transcript/VttCleanup.java) to fix up the junk.

The limitation is that this transcript doesn't say who said it, and the words are somewhat inaccurate.  Over at [debates.org](http://debates.org/index.php?page=debate-transcripts) they have good transcripts, but without the millisecond-accurate timestamps.  So we built our own little tool which mushes these together, with the help of a lot of manual labor.

## Recipe

Syncing a video to its transcript has these steps:

1. Open the transcript gui with `gradlew transcriptGui`.
2. Copy-paste the transcript from [debates.org](http://debates.org/index.php?page=debate-transcripts), and name it as `<DATE>.said` in the `presidential-debates` folder.
3. Add the people and roles to `<DATE>.json`, `all_people.ini`, and `all_roles.ini` (`transcriptGui` will help you find typos).  You can look at `1960-09-26` for a finished example.
4. Use `transcriptGui` to sync the `.said` file and the `.vtt` file.

Here are some steps in more detail:

## 3. Add the people and roles to `<DATE>.json`, `all_people.ini`, and `all_roles.ini`

In the transcriptGui, click "..." to open the details of every transcript in the folder.

- If the date is underlined, that means all of the speakers in the transcript are valid, and you can can start syncing.  The dialog will tell you how many sections remain to be synced.
- If the date is not underlined, then there was an error loading the transcript - probably because a name doesn't match somewhere in `<DATE>.said`, `<DATE>.json`, `all_people.ini`, or `all_roles.ini`. If you click the underlined error, it will print the stack trace to console, which should have the line number of the error.

![Details view](TRANSCRIPT_SYNC_HOW_TO_details.png)

## 4. Use `transcriptGui` to sync the `.said` file and the `.vtt` file.

When syncing the transcript, the normal loop is:

1. Press `Highlight` to hear what was said.
2. Press the checkmark for the one that was correct.

Occasionally, neither side will be right.  In those situations, you can edit either the `.said` or the `.vtt` directly.  If you make any manual edits, you cannot use the checkmarks again until after you have saved.

![Transcript sync interface](TRANSCRIPT_SYNC_HOW_TO_gui.png)
