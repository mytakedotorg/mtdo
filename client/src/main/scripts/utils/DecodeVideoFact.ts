var base64toArrayBuffer = require("base64-arraybuffer");
import { Foundation } from "../../client/src/main/scripts/java2ts/Foundation";

export function decodeVideoFact(
  encoded: Foundation.VideoFactContentEncoded
): Foundation.VideoFactContent {
  const data: ArrayBuffer = base64toArrayBuffer.decode(encoded.data);
  // TODO: data is little-endian.  If the user's browser is big-endian,
  // the decoding will be invalid.  Someday we should detect if the
  // browser is big-endian, and do an endian-swap if it is.  No point
  // doing this until/if we actually have a big-endian device to test
  // with.

  var offset = 0;
  const charOffsets = new Int32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Int32Array.BYTES_PER_ELEMENT;
  const timestamps = new Float32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Float32Array.BYTES_PER_ELEMENT;
  const speakerPerson = new Int32Array(
    data,
    offset,
    encoded.numSpeakerSections
  );
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  const speakerWord = new Int32Array(data, offset, encoded.numSpeakerSections);
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  if (offset != data.byteLength) {
    throw Error("Sizes don't match");
  }
  return {
    fact: encoded.fact,
    durationSeconds: encoded.durationSeconds,
    youtubeId: encoded.youtubeId,
    speakers: encoded.speakers,
    plainText: encoded.plainText,
    charOffsets: charOffsets,
    timestamps: timestamps,
    speakerPerson: speakerPerson,
    speakerWord: speakerWord
  };
}
