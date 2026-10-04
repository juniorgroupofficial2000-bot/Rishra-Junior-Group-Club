import "server-only";

import { getMemberRepository } from "@/server/repositories";

/**
 * Application service for the member portal.
 * UI components call this layer — never mock repositories directly from pages.
 */
export async function loadMemberDashboard(userId: string) {
  return getMemberRepository().getDashboard(userId);
}

export async function loadMemberProfile(userId: string) {
  return getMemberRepository().getProfileByUserId(userId);
}

export async function loadMembership(memberId: string) {
  return getMemberRepository().getMembership(memberId);
}

export async function loadMandate(memberId: string) {
  return getMemberRepository().getMandate(memberId);
}

export async function loadPayments(memberId: string) {
  return getMemberRepository().getPayments(memberId);
}

export async function loadReceipts(memberId: string) {
  return getMemberRepository().getReceipts(memberId);
}

export async function loadMemberEvents(memberId: string) {
  return getMemberRepository().getUpcomingEvents(memberId);
}

export async function loadAttendance(memberId: string) {
  return getMemberRepository().getAttendance(memberId);
}

export async function loadNotifications(memberId: string) {
  return getMemberRepository().getNotifications(memberId);
}
