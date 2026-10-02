import type {
  CreateMemberInput,
  MemberStatusInput,
  UpdateMemberInput,
} from "@/server/validation/member";

export type AdminMemberRecord = {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: MemberStatusInput;
  joinedOn: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  internalNotes: string | null;
  userId: string | null;
  isSample: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  currentPlanLabel: string | null;
};

export type AdminMemberSearchParams = {
  query?: string;
  status?: MemberStatusInput;
  includeDeleted?: boolean;
  sampleOnly?: boolean;
  page: number;
  pageSize: number;
};

export type AdminMemberSearchResult = {
  items: AdminMemberRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminMemberRepository = {
  create(
    input: CreateMemberInput,
    actorUserId: string | null,
  ): Promise<AdminMemberRecord>;
  update(
    id: string,
    input: UpdateMemberInput,
    actorUserId: string | null,
  ): Promise<AdminMemberRecord>;
  softDelete(id: string, actorUserId: string | null): Promise<void>;
  findById(id: string, includeDeleted?: boolean): Promise<AdminMemberRecord | null>;
  search(params: AdminMemberSearchParams): Promise<AdminMemberSearchResult>;
  setStatus(
    id: string,
    status: MemberStatusInput,
    actorUserId: string | null,
    reason?: string,
  ): Promise<AdminMemberRecord>;
  listForExport(params: Omit<AdminMemberSearchParams, "page" | "pageSize">): Promise<
    AdminMemberRecord[]
  >;
};
