import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Menu,
  Play,
  Quote,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const stats = [
  { value: "18+ hrs", label: "Saved weekly per office team" },
  { value: "4.9 / 5", label: "Parent satisfaction rating" },
  { value: "320+", label: "Schools onboarded" },
  { value: "24 / 7", label: "Implementation support" },
];

const pastelFeatures = [
  {
    title: "Admissions",
    description: "Capture inquiries, review applications, and enroll students without spreadsheet chaos.",
    icon: Building2,
    tint: "pastel-blue",
  },
  {
    title: "Academics",
    description: "Organize classes, attendance, exams, and reports in one connected academic flow.",
    icon: GraduationCap,
    tint: "pastel-mint",
  },
  {
    title: "Fees & Finance",
    description: "Generate invoices, track collections, and give families clear payment visibility.",
    icon: CreditCard,
    tint: "pastel-peach",
  },
];

const storyChecklist = [
  "Guided onboarding in under two weeks",
  "Role-based portals for every team member",
  "Real-time visibility for leadership",
  "Parent updates without extra apps",
];

const capabilities = [
  {
    num: "01",
    role: "Admin",
    title: "Run the school from one command center",
    description: "Configure structure, manage staff access, and monitor admissions, fees, and daily operations.",
  },
  {
    num: "02",
    role: "Teacher",
    title: "Focus on teaching, not paperwork",
    description: "Mark attendance, enter grades, and share class updates without switching between tools.",
  },
  {
    num: "03",
    role: "Parent",
    title: "Stay informed and connected",
    description: "View attendance, exam results, fee status, and school announcements in a single portal.",
  },
];

const testimonials = [
  {
    quote:
      "Edunity cut our admin workload in half. Admissions and fee follow-ups that used to take days now happen in hours.",
    name: "Ayesha Farooq",
    role: "Principal, Bright Future School",
  },
  {
    quote:
      "Parents finally have one place for updates. Our team spends less time on calls and more time supporting students.",
    name: "Rizwan Malik",
    role: "Director, Horizon Academy",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For growing schools getting started with digital operations.",
    features: ["Up to 300 students", "Admissions & academics", "Fee essentials", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$129",
    period: "/month",
    description: "Most popular for schools ready to unify every workflow.",
    features: [
      "Up to 1,500 students",
      "Exams, reports & role portals",
      "Priority onboarding",
      "Dedicated success manager",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-campus institutions with advanced needs.",
    features: ["Unlimited scale", "Custom workflows", "SLA & security review", "On-site training"],
    highlighted: false,
  },
];

const footerColumns = [
  {
    title: "Product",
    links: ["Features", "Workflow", "Pricing", "Security"],
  },
  {
    title: "Portals",
    links: ["School Admin", "Teacher", "Parent", "Manager"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "Blog"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies"],
  },
];

export default function Home() {
  return (
    <div className="bg-mesh flex-1">
      {/* Full-width header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-card/90 backdrop-blur-md">
        <div className="marketing-container flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Edunity</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className={cn(buttonVariants({ size: "sm" }), "btn-cta rounded-xl px-4 font-semibold shadow-sm")}
              href="/auth/register"
            >
              Register School
            </Link>
            <button
              className="inline-flex items-center rounded-xl border p-2 text-muted-foreground lg:hidden"
              aria-label="Open navigation"
              type="button"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="marketing-container pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <BadgeCheck className="size-4 text-primary" />
              Trusted by modern schools
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              School operations, finally in one place
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Admissions, academics, fees, and parent communication—unified for administrators, teachers, and families.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "btn-cta h-11 rounded-xl px-6 text-base font-semibold shadow-md"
                )}
                href="/auth/register"
              >
                Register School
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 gap-1.5 rounded-xl px-4 text-base font-medium text-muted-foreground"
                )}
                href="#workflow"
              >
                <Play className="size-4" />
                Watch overview
              </Link>
            </div>
          </div>

          {/* Hero visual composition */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -right-4 -top-4 size-32 rounded-full bg-[var(--pastel-mint)] opacity-80 blur-2xl sm:size-40" />
            <div className="absolute -bottom-6 -left-6 size-28 rounded-full bg-[var(--pastel-peach)] opacity-70 blur-2xl sm:size-36" />
            <div className="relative rounded-3xl border bg-card/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <BookOpen className="size-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Today&apos;s overview</p>
                  <p className="text-sm text-muted-foreground">Crescent Grammar School</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl pastel-blue p-4">
                  <p className="text-xs font-medium text-muted-foreground">Applications</p>
                  <p className="mt-1 text-2xl font-extrabold">47</p>
                  <p className="mt-1 text-xs text-primary">+12 this week</p>
                </div>
                <div className="rounded-2xl pastel-mint p-4">
                  <p className="text-xs font-medium text-muted-foreground">Attendance</p>
                  <p className="mt-1 text-2xl font-extrabold">96%</p>
                  <p className="mt-1 text-xs text-muted-foreground">Across all classes</p>
                </div>
                <div className="rounded-2xl pastel-peach p-4 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Fee collection</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
                    <div className="h-full w-[78%] rounded-full bg-primary" />
                  </div>
                  <p className="mt-2 text-sm font-semibold">78% collected this term</p>
                </div>
              </div>
              <div className="absolute -right-3 top-1/2 hidden size-16 -translate-y-1/2 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg sm:flex">
                <Users className="size-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="marketing-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="marketing-container pb-20">
        {/* Pastel feature cards */}
        <section id="features" className="section-shell">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-primary">Core capabilities</p>
            <h2 className="section-heading mt-2">Everything your school runs on</h2>
            <p className="section-subheading">
              Three pillars of daily operations—designed to work together, not as disconnected tools.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pastelFeatures.map((feature) => (
              <div
                key={feature.title}
                className={cn(
                  "group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1",
                  feature.tint
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-background/70 shadow-sm">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Split story section */}
        <section id="workflow" className="section-shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-primary">Why Edunity</p>
            <h2 className="section-heading mt-2 text-left">Built for how schools actually work</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Stop juggling spreadsheets, WhatsApp groups, and legacy software. Give every role the tools they need
              without overwhelming your team.
            </p>
            <ul className="mt-8 space-y-3">
              {storyChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              className={cn(buttonVariants({ size: "lg" }), "btn-cta mt-8 rounded-xl font-semibold")}
              href="/auth/register"
            >
              Register School
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 size-24 rounded-full border-[6px] border-[var(--pastel-lavender)] bg-background sm:size-32" />
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-[var(--pastel-mint)] p-8 sm:p-10">
              <div className="space-y-4">
                <div className="rounded-2xl border bg-card/90 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admissions</p>
                  <p className="mt-1 text-lg font-bold">12 new applications today</p>
                </div>
                <div className="rounded-2xl border bg-card/90 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Academics</p>
                  <p className="mt-1 text-lg font-bold">Term reports ready to publish</p>
                </div>
                <div className="rounded-2xl border bg-card/90 p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fees</p>
                  <p className="mt-1 text-lg font-bold">₨ 2.4M collected this month</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbered capability band */}
        <section className="section-shell overflow-hidden rounded-3xl bg-band">
          <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
            <div className="mb-10 max-w-xl">
              <p className="text-sm font-semibold text-white/70">For every role</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                One platform, three powerful outcomes
              </h2>
            </div>
            <div className="divide-y divide-white/15">
              {capabilities.map((cap) => (
                <div key={cap.num} className="grid gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-8 lg:grid-cols-[auto_auto_1fr]">
                  <span className="text-4xl font-extrabold text-white/30 sm:text-5xl">{cap.num}</span>
                  <span className="inline-flex h-fit w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                    {cap.role}
                  </span>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <h3 className="text-xl font-bold text-white">{cap.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/75 sm:text-base">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="section-shell">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-primary">Testimonials</p>
            <h2 className="section-heading mt-2">Trusted by school leaders</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((item) => (
              <div key={item.name} className="relative rounded-3xl border bg-card p-8 shadow-sm">
                <Quote className="size-8 text-primary/30" />
                <p className="mt-4 text-base leading-7 text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-6 border-t pt-5">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section-shell">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-primary">Pricing</p>
            <h2 className="section-heading mt-2">Plans that grow with your school</h2>
            <p className="section-subheading">Transparent pricing. No hidden fees. Start with a guided trial.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-3xl border bg-card p-7",
                  plan.highlighted && "border-primary shadow-lg ring-2 ring-primary/20"
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Most popular
                  </span>
                )}
                <p className="text-lg font-bold">{plan.name}</p>
                <p className="mt-3">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-8 w-full rounded-xl font-semibold",
                    plan.highlighted ? "btn-cta" : ""
                  )}
                  href="/auth/register"
                >
                  Register School
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-shell rounded-3xl bg-airy px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to modernize your school?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Join hundreds of schools saving time, reducing errors, and delivering better experiences for staff and
            families.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              className={cn(buttonVariants({ size: "lg" }), "btn-cta h-11 rounded-xl px-8 text-base font-semibold")}
              href="/auth/register"
            >
              Register School
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 rounded-xl text-base")}
              href="/auth/login"
            >
              Sign In
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="marketing-container py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <span className="font-extrabold">Edunity</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Modern school management for admissions, academics, fees, and parent engagement.
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="font-semibold">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="cursor-default text-sm text-muted-foreground">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Edunity. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold text-primary hover:text-primary/80">
                Register School
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
