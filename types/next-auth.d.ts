import type { AppRole } from "@/server/domain/roles";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      memberId: string | null;
      mfaEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    memberId: string | null;
    mfaEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    memberId?: string | null;
    mfaEnabled?: boolean;
    lastValidated?: number;
    error?: "SessionInactive";
  }
}
