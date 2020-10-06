# Factset design

THIS DOCUMENT IS OUT OF DATE

## Fundamental principles

1. The factset must be immutable from the user's perspective.
2. It is okay if the Foundation's *technical* implementation changes, so long as these changes *never change meaning*.
    - e.g. improved transcript encoding, higher-resolution video.
3. Cryptographic trust (e.g. digital signing of the foundation) does not translate into user trust, and is an explicit non-goal.

The result of these is that we use content-addressing for speed, not for security.

An important corner-case is barely-perceptible changes to the foundation, e.g.:

- a debate video mistakenly playing at the wrong framerate (24fps vs 30fps), which requires changing user timestamps
- a text document has a change in punctuation or whitespace, which requires changing referenced offsets

Hopefully we won't encounter these, but we might...

## Use cases

1. Permalinks: `https://mytake.org/foundation-v1/donald-trump-hillary-clinton-23/2972.989-2981.150`
    + `donald-trump-hillary-clinton-23` - semantic label, easy-to-read, can improve technical details without affecting user
    + `2972.989-2981.150` - semantic, not easy-to-read, can improve technical details without affecting user
    + `v1` makes it possible to migrate URL-scheme while providing forever-compatibility shims for old links, possibly via 301 redirect

2. Takes: `https://mytake.org/author/take-title` has content like this:

```json
[
  {
    "kind": "paragraph",
    "text": "Today, anybody who wants to negotiate with a Muslim country is \u201cweak\u201d."
  },
  {
    "kind": "video",
    "videoId": "iEfwIxM7MmnOKb7zt4HqW8IxUWy6F7a236fSOQlUUWI=",
    "range": [304, 321]
  },
  {
    "kind": "paragraph",
    "text": "Thank goodness there's at least one party who is willing to give peace a chance!"
  },
  {
    "kind": "document",
    "excerptId": "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    "highlightedRange": [17730, 18357],
    "viewRange": [17730, 18357]
  }
]
```

Foundation documents are referred to by the hash of their contents.

Relative to referring to documents by their semantic name:

Pros: loading a document does not require an index of any kind
Cons: making a technical change to the foundation, which will change content-addressed-ids, requires a "stop-the-world" migration of all published takes and drafts.  Luckily, the server already has an index of which documents reference which pieces of the foundation, so only a small fraction of the total number of documents will need to be changed.

## Implementation

- `mytake.org/foundation-index-hash.json` looks like this:

```json
{"hash":"c3IA8bL_k-MxVz71DLl43a4fxFIywisc9DaQuIreKA8="}
```

- `mytake.org/foundation-data/c3IA8bL_k-MxVz71DLl43a4fxFIywisc9DaQuIreKA8=` looks like this:

```json
[
    {
        "fact": {
            "title": "United States Constitution",
            "primaryDate": "1788-06-21",
            "primaryDateKind": "ratified",
            "kind": "document"
        },
        "hash": "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg="
    },
    ...
   {
        "fact": {
            "title": "Donald Trump - Hillary Clinton (2/3)",
            "primaryDate": "2016-10-09",
            "primaryDateKind": "recorded",
            "kind": "video"
        },
        "hash": "iEfwIxM7MmnOKb7zt4HqW8IxUWy6F7a236fSOQlUUWI="
    },
]
```

- Fact contents are fetched like this: `mytake.org/foundation-data/c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=`
