import type { AppRole } from "@/server/domain/roles";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      memberId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    memberId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    memberId?: string | null;
  }
}
