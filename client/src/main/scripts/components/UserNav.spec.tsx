import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import UserNav from "./UserNav";

let wrapper: ReactWrapper;

describe("UserNav", () => {
  beforeAll(() => {
    wrapper = mount(<UserNav />);
  });

  test("UserNav logged out", () => {
    expect(wrapper.find(".usernav__dropdown").children().length).toBe(0);
  });

  test("UserNav logged in", () => {
    wrapper.setState({ cookie: { username: "Samples" } });
    expect(wrapper.find(".usernav__dropdown").children().length).toBe(6);
  });
});
