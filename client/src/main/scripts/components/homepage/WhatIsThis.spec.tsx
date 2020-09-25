import * as React from "react";
import * as renderer from "react-test-renderer";
import { SocialLoading } from "./infoHeader";
import { useSocialsMock } from "./infoHeaderTest";
import WhatIsThis from "./WhatIsThis";

jest.mock("./HomeSection", () => ({
  __esModule: true,
  default: "HomeSection",
}));

test("WhatIsThis", () => {
  const { leftSocial, rightSocial } = useSocialsMock();
  const tree = renderer
    .create(<WhatIsThis leftSocial={leftSocial} rightSocial={rightSocial} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("WhatIsThis loading", () => {
  const loadingComponent = SocialLoading({})!;
  const tree = renderer
    .create(
      <WhatIsThis
        leftSocial={loadingComponent}
        rightSocial={loadingComponent}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
