/**
 * Public club listings used by Hindusthan-style pages.
 * Officer portraits remain the governing-body subset of the official roster.
 */

import { governingBodyMembers } from "@/content/club-roster";

export const founderMembers = governingBodyMembers.map((member) => ({
  name: member.name,
  role: member.role,
  portrait: member.portrait ?? "/images/committee/portrait-placeholder.svg",
}));
