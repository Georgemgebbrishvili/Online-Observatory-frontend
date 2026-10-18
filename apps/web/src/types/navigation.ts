export type PublicNavigationDictionary = {
  ariaLabel: string;
  menu: string;
  closeMenu: string;
  book: string;
  observatory: string;
  pricing: string;
  signIn: string;
  reserve: string;
  account: string;
  overview: string;
};

export type AppNavigationDictionary = {
  ariaLabel: string;
  home: string;
  book: string;
  live: string;
  collection: string;
  profile: string;
  // Reachable and navigable, and honest that they are not built. The phase that
  // fills each one is in features/navigation/navigation-model.ts.
  subscription: string;
  loyalty: string;
  passes: string;
  plannedGroup: string;
  previewEyebrow: string;
  previewDescription: string;
  plannedEyebrow: string;
  plannedDescription: string;
};
