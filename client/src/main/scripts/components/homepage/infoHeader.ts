export interface Tab {
  tabTitle: string;
  component?: React.Component;
}

export const INFO_HEADER_TABS: Tab[] = [
  {
    tabTitle: "How to use this",
  },
  {
    tabTitle: "What is this",
  },
  {
    tabTitle: "Get involved",
  },
];
