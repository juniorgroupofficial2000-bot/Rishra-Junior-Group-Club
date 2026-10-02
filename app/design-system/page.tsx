import {
  CommitteeCard,
  DashboardGrid,
  DashboardPanel,
  EventCard,
  GalleryGrid,
  MemberCard,
  StatTile,
  Timeline,
} from "@/components/club";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/fade-in";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SectionHeader,
  Select,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TBody,
  TD,
  Textarea,
  TH,
  THead,
  TR,
} from "@/components/ui";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InteractiveDemos } from "./interactive-demos";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Ink & Alta design system for Rishra Junior Group Club — tokens and reusable components.",
  robots: { index: false, follow: false },
};

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="min-w-0">
      <div className={`h-16 rounded-lg border border-border-subtle ${className}`} />
      <p className="mt-2 font-mono text-xs text-ink-600">{name}</p>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6 border-t border-border-subtle pt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="bg-heritage-grain">
      <div className="border-b border-border-subtle bg-surface-raised">
        <div className="container-page py-10 sm:py-14">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Home", href: "/" },
              { label: "Design System" },
            ]}
          />
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-alta-600">
              Ink & Alta
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              Rishra Junior Group Club
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-500">
              Reusable tokens and components for the public site, member portal,
              and admin tools. This page is a styleguide — not the product website.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="container-page space-y-4 py-12 sm:space-y-6 sm:py-16">
        <Section id="color" title="Color tokens">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="ink-900" className="bg-ink-900" />
            <Swatch name="ink-700" className="bg-ink-700" />
            <Swatch name="ink-100" className="bg-ink-100" />
            <Swatch name="alta-500" className="bg-alta-500" />
            <Swatch name="marigold-500" className="bg-marigold-500" />
            <Swatch name="lotus-500" className="bg-lotus-500" />
            <Swatch name="jasmine-50" className="bg-jasmine-50" />
            <Swatch name="jasmine-100" className="bg-jasmine-100" />
            <Swatch name="surface-raised" className="bg-surface-raised" />
            <Swatch name="success-100" className="bg-success-100" />
            <Swatch name="warning-100" className="bg-warning-100" />
            <Swatch name="danger-100" className="bg-danger-100" />
          </div>
        </Section>

        <Section id="typography" title="Typography">
          <div className="space-y-6 rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-xs">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-400">Display</p>
              <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink-900">
                Community since 2000
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-400">UI</p>
              <p className="mt-1 text-base leading-relaxed text-ink-600">
                Source Sans 3 for interface copy, forms, and dense admin reading.
                Keep sentences short; prefer clarity over ornament.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-400">Mono</p>
              <p className="mt-1 font-mono text-sm text-ink-700">
                RJGC-MEM-[PLACEHOLDER]
              </p>
            </div>
          </div>
        </Section>

        <Section id="section-headers" title="Section headers">
          <SectionHeader
            eyebrow="Heritage"
            title="Saraswati Puja archive"
            description="[PLACEHOLDER: Short supporting sentence about the archive.]"
            actions={<Button variant="outline">Browse years</Button>}
          />
        </Section>

        <Section id="buttons" title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section id="badges" title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="heritage">Heritage</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        <Section id="inputs" title="Inputs">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="member-name"
              label="Full name"
              placeholder="[PLACEHOLDER: Member name]"
              hint="As registered with the club."
            />
            <Select id="membership-type" label="Membership type" defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option value="regular">Regular</option>
              <option value="honorary">Honorary</option>
            </Select>
            <Textarea
              id="notes"
              className="md:col-span-2"
              label="Notes"
              placeholder="Optional admin notes"
            />
          </div>
        </Section>

        <Section id="cards" title="Cards">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Membership dues</CardTitle>
              <CardDescription>
                Card surfaces group interactive or dense content — not hero marketing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-600">
                Amount: [PLACEHOLDER: dues amount]
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section id="club-cards" title="Event · Committee · Member cards">
          <Stagger className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <EventCard
                title="Saraswati Puja"
                dateLabel="[PLACEHOLDER: date]"
                locationLabel="786, Morepukur, Natun Gram, Rishra"
                description="[PLACEHOLDER: Short event summary.]"
                status="upcoming"
                href="/design-system"
              />
            </StaggerItem>
            <StaggerItem>
              <CommitteeCard
                name="[PLACEHOLDER: Name]"
                role="[PLACEHOLDER: Role]"
                tenureLabel="2026"
                description="[PLACEHOLDER: Brief responsibility note.]"
              />
            </StaggerItem>
            <StaggerItem>
              <MemberCard
                name="[PLACEHOLDER: Name]"
                membershipId="RJGC-0000"
                status="active"
                sinceLabel="[PLACEHOLDER: year]"
              />
            </StaggerItem>
          </Stagger>
        </Section>

        <Section id="timeline" title="Timeline">
          <Timeline
            items={[
              {
                id: "2000",
                year: "2000",
                title: "Saraswati Puja begins",
                description:
                  "Organizing since 1 February 2000. [PLACEHOLDER: additional verified history.]",
              },
              {
                id: "reg",
                year: "—",
                title: "Formal club registration",
                description:
                  "[PLACEHOLDER: Registration details when available.]",
              },
            ]}
          />
        </Section>

        <Section id="gallery" title="Gallery">
          <GalleryGrid
            items={[
              { id: "1", alt: "Archive placeholder A", tone: "ink", caption: "Year [PLACEHOLDER]" },
              { id: "2", alt: "Archive placeholder B", tone: "alta", caption: "Year [PLACEHOLDER]" },
              { id: "3", alt: "Archive placeholder C", tone: "marigold", caption: "Year [PLACEHOLDER]" },
              { id: "4", alt: "Archive placeholder D", tone: "lotus", caption: "Year [PLACEHOLDER]" },
            ]}
          />
        </Section>

        <Section id="tabs" title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dues">Dues</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-ink-600">Overview panel content.</p>
            </TabsContent>
            <TabsContent value="dues">
              <p className="text-sm text-ink-600">Dues panel content.</p>
            </TabsContent>
            <TabsContent value="events">
              <p className="text-sm text-ink-600">Events panel content.</p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="table" title="Tables">
          <Table>
            <THead>
              <TR>
                <TH>Member</TH>
                <TH>Status</TH>
                <TH>Dues</TH>
              </TR>
            </THead>
            <TBody>
              <TR>
                <TD>[PLACEHOLDER: Name]</TD>
                <TD>
                  <Badge variant="success">Active</Badge>
                </TD>
                <TD className="font-mono">[PLACEHOLDER]</TD>
              </TR>
              <TR>
                <TD>[PLACEHOLDER: Name]</TD>
                <TD>
                  <Badge variant="warning">Pending</Badge>
                </TD>
                <TD className="font-mono">[PLACEHOLDER]</TD>
              </TR>
            </TBody>
          </Table>
        </Section>

        <Section id="dashboard" title="Dashboard components">
          <DashboardGrid>
            <StatTile label="Members" value="—" hint="[PLACEHOLDER: count]" />
            <StatTile label="Dues collected" value="—" hint="This month" />
            <StatTile label="Events" value="—" hint="Upcoming" />
            <StatTile label="Announcements" value="—" hint="Unread" />
          </DashboardGrid>
          <div className="mt-4">
            <DashboardPanel
              title="Recent activity"
              description="Admin audit-friendly summary strip."
              actions={<Button size="sm" variant="outline">Export</Button>}
            >
              <p className="text-sm text-ink-500">
                [PLACEHOLDER: Activity feed rows.]
              </p>
            </DashboardPanel>
          </div>
        </Section>

        <Section id="overlays" title="Modal & toast">
          <InteractiveDemos />
        </Section>
      </div>
    </main>
  );
}
