import Link from "next/link";
import { courses } from "@/data/content";
import { Icon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function CoursesSection() {
  return (
    <section id="courses" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="CELPIP Courses"
            title="Pick a course, build the skill"
            subtitle="Guided lessons, reusable templates, and AI-scored practice for every section of the exam."
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course, i) => (
            <Reveal key={course.title} delay={i * 80}>
              <Link
                href={course.href}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${course.accentBg} ${course.accentText}`}
                  >
                    <Icon name={course.icon} size={22} />
                  </span>
                  {course.badge ? (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                      {course.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-600">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-500">
                  {course.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-blue-600">
                  Explore course
                  <Icon
                    name="arrow-right"
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
