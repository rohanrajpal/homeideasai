import { createContext, useContext, useEffect, useState } from "react";
import { usersCurrentUser } from "@/app/openapi-client";

type UserContextType = {
  email: string;
  isVerified: boolean;
  creditsAvailable: number | null;
  refreshUserData: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("user@example.com");
  const [isVerified, setIsVerified] = useState(false);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);

  const refreshUserData = async () => {
    try {
      const userData = await usersCurrentUser();
      if (userData.data) {
        setEmail(userData.data.email);
        setIsVerified(userData.data.is_verified ?? false);
        setCreditsAvailable(userData.data.credits ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider
      value={{
        email,
        isVerified,
        creditsAvailable,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
