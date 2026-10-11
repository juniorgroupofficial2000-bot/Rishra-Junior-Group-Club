import { founderMembers } from "@/content/club-public";

export function ClubMemberGrid() {
  return (
    <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {founderMembers.map((member) => (
        <li key={member.name} className="text-center">
          <img
            src={member.portrait}
            alt={`${member.name}, ${member.role}`}
            className="mx-auto h-56 w-44 object-cover object-top"
          />
          <h2 className="mt-4 font-display text-xl text-logo-blue">{member.name}</h2>
          <p className="mt-1 text-sm tracking-wide text-[#333333]">{member.role}</p>
        </li>
      ))}
    </ul>
  );
}
