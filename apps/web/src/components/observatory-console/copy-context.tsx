'use client';

import { createContext, useContext } from 'react';
import { consoleCopy, type ConsoleCopy } from './copy';

const CopyContext = createContext<ConsoleCopy>(consoleCopy.en);

export const CopyProvider = CopyContext.Provider;

/** The console's words in the page's language; the panels and dialogs read them here. */
export function useCopy(): ConsoleCopy {
  return useContext(CopyContext);
}
