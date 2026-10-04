import type {
  CreateMemberInput,
  MemberStatusInput,
  UpdateMemberInput,
} from "@/server/validation/member";

export type AdminMemberRecord = {
  id: string;
  membershipNumber: string;
  cardPublicId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  status: MemberStatusInput;
  joinedOn: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  reviewNotes: string | null;
  statusReason: string | null;
  portraitAssetId: string | null;
  portraitUrl: string | null;
  internalNotes: string | null;
  userId: string | null;
  isSample: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  currentPlanLabel: string | null;
  currentPlanId: string | null;
  committeeRoleLabel: string | null;
  paymentStatusLabel: string | null;
};

export type AdminMemberSearchParams = {
  query?: string;
  status?: MemberStatusInput;
  planId?: string;
  committeeRole?: string;
  joinedFrom?: Date;
  joinedTo?: Date;
  ids?: string[];
  sortBy?:
    | "updatedAt"
    | "joinedOn"
    | "membershipNumber"
    | "displayName"
    | "status";
  sortDir?: "asc" | "desc";
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
    input: CreateMemberInput & { membershipNumber: string },
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
    reviewNotes?: string,
  ): Promise<AdminMemberRecord>;
  listForExport(params: Omit<AdminMemberSearchParams, "page" | "pageSize">): Promise<
    AdminMemberRecord[]
  >;
};
