/**
 * Canonical public roster and programmes provided by the club.
 * English display names; roles shown without personal contact details.
 */

export type ClubRosterMember = {
  serial: number;
  name: string;
  role: string;
  portrait?: string;
};

export type SubCommitteeSeat = {
  name: string;
  role: string;
  note?: string;
};

export type SubCommitteeRoster = {
  slug: string;
  name: string;
  aims?: string;
  seats: SubCommitteeSeat[];
};

const portraits: Record<string, string> = {
  "Satrudhan Burman": "/images/committee/monu.png",
  "Suraj Kumar Burman": "/images/committee/suraj-kumar-burman.png",
  "Bishal Pandey": "/images/committee/Bishal.png",
  "Aalok Barma": "/images/committee/Aalok.png",
  "Gopal Kumar Burman": "/images/committee/Gopal.png",
  "Sashikant Tiwari": "/images/committee/sashikant.png",
  "Chandan Kumar Sharma": "/images/committee/chandan.png",
  "Rohit Barman": "/images/committee/rohit-barma.png",
  "Dipak Kumar Burman": "/images/committee/dipak-burman.png",
  "Vikesh Dwivedi": "/images/committee/vikash-dwivedi.png",
};

export const juniorGroupMembers: ClubRosterMember[] = [
  { serial: 1, name: "Satrudhan Burman", role: "President" },
  { serial: 2, name: "Suraj Kumar Burman", role: "Vice President" },
  { serial: 3, name: "Bishal Pandey", role: "Secretary" },
  { serial: 4, name: "Aalok Barma", role: "Treasurer" },
  { serial: 5, name: "Gopal Kumar Burman", role: "Committee Member" },
  { serial: 6, name: "Sashikant Tiwari", role: "Committee Member" },
  { serial: 7, name: "Chandan Kumar Sharma", role: "Committee Member" },
  { serial: 8, name: "Abhishek Kurmi", role: "Member" },
  { serial: 9, name: "Aditya Pandey", role: "Member" },
  { serial: 10, name: "Aditya Vishwakarma", role: "Member" },
  { serial: 11, name: "Ajit Singh", role: "Member" },
  { serial: 12, name: "Aman Gupta", role: "Member" },
  { serial: 13, name: "Aman Srivastava", role: "Member" },
  { serial: 14, name: "Arun Kumar Burman", role: "Member" },
  { serial: 15, name: "Bharat Kumar Barman", role: "Member" },
  { serial: 16, name: "Bishwanath Burman", role: "Member" },
  { serial: 17, name: "Dipak Kumar Burman", role: "Member" },
  { serial: 18, name: "Ganesh Sharma", role: "Member" },
  { serial: 19, name: "Gourab Roy", role: "Member" },
  { serial: 20, name: "Jitu Pandey", role: "Member" },
  { serial: 21, name: "Manjit Kumar", role: "Member" },
  { serial: 22, name: "Nayan Biswas", role: "Member" },
  { serial: 23, name: "Pintu Kumar Shaw", role: "Member" },
  { serial: 24, name: "Raja Khori", role: "Member" },
  { serial: 25, name: "Rajesh Burman", role: "Member" },
  { serial: 26, name: "Ramnaresh Burman", role: "Member" },
  { serial: 27, name: "Ranjan Sharma", role: "Member" },
  { serial: 28, name: "Rohan Tiwari", role: "Member" },
  { serial: 29, name: "Rohit Barman", role: "Member" },
  { serial: 30, name: "Rounak Kumar Shaw", role: "Member" },
  { serial: 31, name: "Sumit Kumar Shaw", role: "Member" },
  { serial: 32, name: "Suraj Kumar Prasad", role: "Member" },
  { serial: 33, name: "Tushar Kumar Verma", role: "Member" },
  { serial: 34, name: "Vicky Verma", role: "Member" },
  { serial: 35, name: "Vikesh Dwivedi", role: "Member" },
  { serial: 36, name: "Rajkumar Shaw", role: "Member" },
  { serial: 37, name: "Rekha Burman", role: "Member" },
  { serial: 38, name: "Rajkumari Burman", role: "Member" },
  { serial: 39, name: "Suman Burman", role: "Member" },
  { serial: 40, name: "Tanu Sharma", role: "Member" },
  { serial: 41, name: "Priti Sharma", role: "Member" },
  { serial: 42, name: "Jaya Sharma", role: "Member" },
  { serial: 43, name: "Goli Sharma", role: "Member" },
  { serial: 44, name: "Sakshi Sharma", role: "Member" },
  { serial: 45, name: "Rupa Barma", role: "Member" },
  { serial: 46, name: "Rina Devi Shaw", role: "Member" },
  { serial: 47, name: "Sunita Devi Sharma", role: "Member" },
  { serial: 48, name: "Rimi Devi Burman", role: "Member" },
].map((member) => ({
  ...member,
  portrait: portraits[member.name] ?? "/images/committee/portrait-placeholder.svg",
}));

export const governingBodyMembers = juniorGroupMembers.filter(
  (member) => member.serial <= 7,
);

const presidentExOfficio: SubCommitteeSeat = {
  name: "Satrudhan Burman",
  role: "President",
  note: "Ex-Officio",
};

const secretaryExOfficio: SubCommitteeSeat = {
  name: "Bishal Pandey",
  role: "Secretary",
  note: "Ex-Officio",
};

function seats(
  rows: Array<[string, string]>,
): SubCommitteeSeat[] {
  return [
    ...rows.map(([name, role]) => ({ name, role })),
    presidentExOfficio,
    secretaryExOfficio,
  ];
}

export const subCommitteeRosters: SubCommitteeRoster[] = [
  {
    slug: "cultural-heritage",
    name: "Cultural & Heritage Sub-Committee",
    aims: "Cultural promotion, tradition and heritage preservation, and celebrating customs.",
    seats: seats([
      ["Aalok Barma", "Chairman"],
      ["Dipak Kumar Burman", "Convenor"],
      ["Bishwanath Burman", "Member"],
      ["Arun Kumar Burman", "Member"],
    ]),
  },
  {
    slug: "social-networking",
    name: "Social Networking & Bonds Sub-Committee",
    aims: "Social networking and interaction, and strengthening community bonds.",
    seats: seats([
      ["Satrudhan Burman", "Chairman"],
      ["Vikesh Dwivedi", "Convenor"],
      ["Aditya Vishwakarma", "Member"],
      ["Bharat Kumar Barman", "Member"],
      ["Aman Srivastava", "Member"],
    ]),
  },
  {
    slug: "sports-recreation",
    name: "Sports & Recreation Sub-Committee",
    aims: "Recreational development, sports, leisure, and tournaments.",
    seats: seats([
      ["Bishal Pandey", "Chairman"],
      ["Sashikant Tiwari", "Convenor"],
      ["Manjit Kumar", "Member"],
      ["Rounak Kumar Shaw", "Member"],
      ["Arun Kumar Burman", "Member"],
    ]),
  },
  {
    slug: "literary-artistic",
    name: "Literary & Artistic Sub-Committee",
    aims: "Literary and artistic promotion, supporting arts, and creative writing.",
    seats: seats([
      ["Chandan Kumar Sharma", "Chairman"],
      ["Rohit Barman", "Convenor"],
      ["Aditya Pandey", "Member"],
      ["Aman Gupta", "Member"],
      ["Gourab Roy", "Member"],
    ]),
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness Sub-Committee",
    aims: "Health programmes, medical camps, and well-being initiatives.",
    seats: seats([
      ["Suraj Kumar Burman", "Chairman"],
      ["Ranjan Sharma", "Convenor"],
      ["Pintu Kumar Shaw", "Member"],
      ["Tushar Kumar Verma", "Member"],
      ["Jitu Pandey", "Member"],
    ]),
  },
  {
    slug: "education-learning",
    name: "Education & Lifelong Learning Sub-Committee",
    aims: "Educational programmes, personal growth, intellectual engagement, and skill training.",
    seats: seats([
      ["Gopal Kumar Burman", "Chairman"],
      ["Rohan Tiwari", "Convenor"],
      ["Abhishek Kurmi", "Member"],
      ["Sumit Kumar Shaw", "Member"],
      ["Suraj Kumar Prasad", "Member"],
    ]),
  },
  {
    slug: "social-welfare",
    name: "Social Welfare & Charity Sub-Committee",
    aims: "Social welfare, charitable initiatives, community service, and relief drives.",
    seats: seats([
      ["Rohit Barman", "Chairman"],
      ["Nayan Biswas", "Convenor"],
      ["Raja Khori", "Member"],
    ]),
  },
  {
    slug: "it-media-pr",
    name: "IT, Media & Public Relations Sub-Committee",
    seats: seats([
      ["Sashikant Tiwari", "Chairman"],
      ["Aman Gupta", "Convenor"],
      ["Dipak Kumar Burman", "Member"],
      ["Bishwanath Burman", "Member"],
      ["Aalok Barma", "Member"],
      ["Nayan Biswas", "Member"],
    ]),
  },
  {
    slug: "girls-welfare",
    name: "Girls Welfare Sub-Committee",
    seats: seats([
      ["Tanu Sharma", "Chairman"],
      ["Rekha Burman", "Convenor"],
      ["Rupa Barma", "Member"],
      ["Rajkumari Burman", "Member"],
    ]),
  },
  {
    slug: "women-welfare",
    name: "Women Welfare Sub-Committee",
    seats: seats([
      ["Sunita Devi Sharma", "Chairman"],
      ["Rina Devi Shaw", "Convenor"],
      ["Rimi Devi Burman", "Member"],
    ]),
  },
  {
    slug: "senior-members",
    name: "Senior Members Sub-Committee",
    seats: seats([
      ["Rajesh Burman", "Chairman"],
      ["Ajit Singh", "Convenor"],
      ["Ganesh Sharma", "Member"],
      ["Ramnaresh Burman", "Member"],
      ["Radheshyam Barma", "Member"],
      ["Rakesh Pandey", "Member"],
      ["Rajkumar Shaw", "Member"],
    ]),
  },
];

export const subCommitteeReserveNote =
  "All remaining members of the general body who are not listed in the permanent sub-committees constitute the Strategic Reserve Task Force. This pool may be co-opted by the Governing Body for large-scale events, seasonal relief drives, and operational needs.";

export const sponsorshipPackages = [
  "Main Entrance Gate",
  "Main Exit Gate",
  "VIP / Invitee Entrance",
  "Mega Road Hoarding",
  "Commercial Stall",
  "Standard Banner",
  "Branding Pillar",
  "Street Light Post",
  "Helpdesk / First Aid Counter",
  "Main Stage Backdrop / Presentation Area",
  "Members & Spectators Gallery",
  "Official Kit / Jersey Sponsor",
] as const;

export const upcomingEventCalendar = [
  {
    month: "January",
    items: ["Netaji Jayanti", "Republic Day", "Annual Sports (Phase 1)"],
  },
  {
    month: "February",
    items: ["Saraswati Puja", "Annual Sports (Phase 2)"],
  },
  {
    month: "March",
    items: ["Holi / Basanta Utsav"],
  },
  {
    month: "April",
    items: ["Summer Cricket Premier League / Indoor Games"],
  },
  {
    month: "June",
    items: ["World Environment Day (5 June) — Tree Plantation Drive"],
  },
  {
    month: "August",
    items: ["Independence Day Celebration"],
  },
  {
    month: "November",
    items: ["Diwali", "Kali Puja", "Chhath Puja Seva Camp"],
  },
  {
    month: "December",
    items: ["Winter Cricket Premier League / RJGC Premier League Final"],
  },
] as const;

export const noticeChannels = [
  {
    title: "Official Notice",
    summary:
      "Board meetings, AGMs, amendments, and core club rules.",
    href: "/announcements",
  },
  {
    title: "Sports Update",
    summary:
      "Turf bookings, badminton courts, and tournament schedules.",
    href: "/events",
  },
  {
    title: "Event Update",
    summary:
      "Puja coordination, regional festival celebrations, and social meetups.",
    href: "/events",
  },
  {
    title: "Perks Update",
    summary:
      "Gym registration, cafe discounts, restaurant tie-ups, and vendor activations.",
    href: "/facilities",
  },
] as const;

export const virtualFacilities = [
  {
    title: "Turf & Badminton",
    perk: "15%–20% off hourly slot bookings during club sports hours or weekdays.",
    pitch:
      "We will bring our group of 20+ players during empty or off-peak morning slots, giving the venue guaranteed business.",
  },
  {
    title: "Gym",
    perk: "Special group rate on monthly or annual packages, below public rates.",
    pitch:
      "Individuals hesitate to join alone. We market the gym directly to our community as the official fitness partner.",
  },
  {
    title: "Outdoor Pool",
    perk: "Discounted entry tickets or a fixed seasonal monthly rate for members.",
    pitch:
      "Instead of occasional swimmers, members will visit regularly and buy snacks from pool-side stalls.",
  },
  {
    title: "Restaurant & Cafe",
    perk: "Flat 10%–15% off the total bill with a Digital Club ID Card.",
    pitch:
      "We will make the cafe our official weekly hangout, where members meet, eat, and bring repeat revenue.",
  },
  {
    title: "Banquet Hall",
    perk: "Rental fee waived or free catering upgrades for family weddings and birthdays.",
    pitch:
      "Members host multiple family events a year. We will route those bookings to the partner venue.",
  },
  {
    title: "Carrom Room",
    perk: "Free access to boards at a local youth club, or 20% off at a local gaming parlour.",
    pitch:
      "We will organise monthly indoor tournaments, which will popularise the venue among local youth.",
  },
  {
    title: "Library",
    perk: "Zero security deposit or 20% off monthly reading-room subscription fees.",
    pitch:
      "We will promote the reading space to students and book-lovers in our community, increasing footfall.",
  },
] as const;
