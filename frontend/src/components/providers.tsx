// Create a Providers component to wrap your application with all the components requiring 'use client', such as next-nprogress-bar or your different contexts...
"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { UserProvider } from "./user-context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      {children}
      <ProgressBar
        height="4px"
        color="#F42652"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </UserProvider>
  );
};

export default Providers;
