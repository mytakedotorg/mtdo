import { encodeSocial, decodeSocial, VideoCut } from "./social";

test("encodeSocial roundtrip", async () => {
  const cut: VideoCut = {
    cut: [20.3199, 30.6789],
    fact: '6Ggh-o_=',
    kind: 'videoCut'
  };
  const expected = "~cut:(20.3199,30.6789),fact:'6Ggh-o_=',kind:videoCut";
  expect(encodeSocial(cut)).toBe(expected);
  expect(encodeSocial(decodeSocial(expected))).toBe(expected);

});
