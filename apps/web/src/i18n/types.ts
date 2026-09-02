import type { FooterDictionary, HomepageDictionary } from "@/types/homepage";
import type {
  AppNavigationDictionary,
  PublicNavigationDictionary,
} from "@/types/navigation";

export type Dictionary = {
  metadata: {
    title: string;
    description: string;
  };
  navigation: {
    ariaLabel: string;
    skip: string;
    language: string;
    languageName: string;
    brandAriaLabel: string;
    brandEndorsement: string;
    public: PublicNavigationDictionary;
    app: AppNavigationDictionary;
  };
  home: HomepageDictionary;
  footer: FooterDictionary;
  notFound: {
    title: string;
    action: string;
  };
};
