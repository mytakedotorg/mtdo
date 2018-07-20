import { TurnFinder } from "./searchFunc";

test("turnfinder-corner-case", () => {
  let finder = new TurnFinder("farm");
  let withResults = finder.findResults(
    "Uh - Senator Kennedy, during your brief speech a few minutes ago you mentioned farm surpluses."
  );
  expect(withResults.foundOffsets.length).toBe(1);
  let expanded = withResults.expandBy(1);

  expect(expanded.length).toBe(1);
  expect(expanded[0].cut[0]).toBe(0);
  // to find these, look at "col" value in bottom-right of VSCode.  Might be worth making a nice test harness
  // to make it easier to read than a number, dunno
  expect(expanded[0].cut[1]).toBe(94);
});
