export type PublicNavigationDictionary = {
  ariaLabel: string;
  menu: string;
  closeMenu: string;
  explore: string;
  live: string;
  observatory: string;
  pricing: string;
  about: string;
  signIn: string;
  startExploring: string;
};

export type AppNavigationDictionary = {
  ariaLabel: string;
  sidebarAriaLabel: string;
  brandAriaLabel: string;
  brandEndorsement: string;
  home: string;
  missions: string;
  live: string;
  collection: string;
  profile: string;
  // Reachable and navigable, and honest that they are not built. The phase that
  // fills each one is in features/navigation/navigation-model.ts.
  book: string;
  subscription: string;
  loyalty: string;
  passes: string;
  plannedGroup: string;
  // The bottom bar carries the five primary destinations only.
  mobile: {
    home: string;
    missions: string;
    live: string;
    collection: string;
    profile: string;
  };
  observatory: string;
  observatoryName: string;
  statusOnline: string;
  simulated: string;
  previewEyebrow: string;
  previewDescription: string;
  plannedEyebrow: string;
  plannedDescription: string;
};
