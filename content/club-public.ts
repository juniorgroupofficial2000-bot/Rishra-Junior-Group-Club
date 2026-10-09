/**
 * Public club listings supplied for the Hindusthan-style layout.
 * Facility cards and homepage news are placeholders until the club replaces them.
 */

export const founderMembers = [
  {
    name: "Satrudhan Burman",
    role: "President",
    portrait: "/images/committee/monu.png",
  },
  {
    name: "Bishal Pandey",
    role: "Secretary",
    portrait: "/images/committee/Bishal.png",
  },
  {
    name: "Aalok Barma",
    role: "Treasurer",
    portrait: "/images/committee/Aalok.png",
  },
  {
    name: "Suraj Kumar Burman",
    role: "Vice President",
    portrait: "/images/committee/suraj-kumar-burman.png",
  },
] as const;

export const placeholderFacilities = [
  {
    title: "Community Hall",
    summary: "Sample listing for gatherings. Replace with the real space, hours, and photograph.",
    image: "/images/home/hero-placeholder-a.svg",
  },
  {
    title: "Puja Ground",
    summary: "Sample listing for the annual Saraswati Puja site. Replace with the real location.",
    image: "/images/home/hero-placeholder-b.svg",
  },
  {
    title: "Meeting Room",
    summary: "Sample listing for committee meetings. Replace when a room is confirmed.",
    image: "/images/home/gallery-01.svg",
  },
  {
    title: "Youth Corner",
    summary: "Sample listing for youth activities. Replace with the activity the club actually hosts.",
    image: "/images/home/gallery-02.svg",
  },
] as const;

export const placeholderNews = [
  {
    title: "Saraswati Puja planning opens",
    date: "Sample · 2026",
    summary: "Placeholder news card. Swap this for a real announcement when it is ready.",
    href: "/announcements",
  },
  {
    title: "Membership enquiries",
    date: "Sample · 2026",
    summary: "Placeholder news card for people asking how to join the club.",
    href: "/membership",
  },
  {
    title: "Neighbourhood gathering",
    date: "Sample · 2026",
    summary: "Placeholder news card for a community evening at Junior Group.",
    href: "/events",
  },
] as const;
