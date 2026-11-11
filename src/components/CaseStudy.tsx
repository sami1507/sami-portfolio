import { copy, homePath, projectPath, type Locale } from "@/data/site";
import { projects, type Project } from "@/data/projects";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Contact } from "./Contact";
import { ProjectVisual, Phone } from "./ProjectVisual";
import { Arrow } from "./Icons";
import { interfaceCopy } from "@/data/interface";
export function CaseStudy({
  locale,
  project,
}: {
  locale: Locale;
  project: Project;
}) {
  const t = copy[locale];
  const ui = interfaceCopy[locale];
  const next =
    projects[
      (projects.findIndex((p) => p.slug === project.slug) + 1) % projects.length
    ];
  return (
    <>
      <Header locale={locale} slug={project.slug} />
      <main id="main" tabIndex={-1}>
        <section className="case-hero container">
          <a className="back-link" href={`${homePath(locale)}#work`}>
            <span aria-hidden="true">←</span>
            {t.back}
          </a>
          <p className="eyebrow">
            {project.number} / {t.projectLabel} / {project.category[locale]}
          </p>
          <div className="case-title-row">
            <h1>
              <bdi>{project.name}</bdi>
            </h1>
            <div className="case-actions">
              <a className="button button-primary" href={project.github}>
                GitHub
                <Arrow diagonal />
              </a>
              {project.live && (
                <a className="button button-outline" href={project.live}>
                  {t.live}
                  <Arrow diagonal />
                </a>
              )}
            </div>
          </div>
          <p className="case-summary">{project.summary[locale]}</p>
          <dl className="case-facts">
            <div>
              <dt>{t.roleLabel}</dt>
              <dd>{project.role[locale]}</dd>
            </div>
            <div>
              <dt>{t.statusLabel}</dt>
              <dd>{project.status[locale]}</dd>
            </div>
            <div>
              <dt>{t.stackLabel}</dt>
              <dd>
                {project.stack.map((tech, i) => (
                  <span key={tech}>
                    <bdi>{tech}</bdi>
                    {i < project.stack.length - 1 ? " · " : ""}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <p className="role-note">{project.roleNote[locale]}</p>
          <div className="case-cover">
            <ProjectVisual kind={project.visual} locale={locale} />
          </div>
        </section>
        <div className="case-content container">
          {project.sections.map((section, i) => (
            <section className="case-section" key={i}>
              <div>
                <span className="project-number">0{i + 1}</span>
                <h2>{section.title[locale]}</h2>
              </div>
              <p>{section.body[locale]}</p>
            </section>
          ))}
        </div>
        {project.slug === "pathy" && (
          <section className="case-gallery container" aria-label={ui.gallery}>
            <Phone src="/images/pathy-offline.webp" alt={ui.offlineAlt} />
            <Phone src="/images/pathy-guidance.webp" alt={ui.guidanceAlt} />
            <div>
              <p className="eyebrow">{ui.offlineEyebrow}</p>
              <h2>{ui.offlineTitle}</h2>
              <p>{ui.offlineBody}</p>
            </div>
          </section>
        )}
        <section className="case-references container">
          <p className="eyebrow">{t.references}</p>
          {project.evidence.map((item) => (
            <a href={item.url} key={item.url}>
              <span dir="auto">{item.label[locale]}</span>
              <Arrow diagonal />
            </a>
          ))}
        </section>
        <div className="next-project container">
          <span className="eyebrow">{t.next}</span>
          <a href={projectPath(locale, next.slug)}>
            <bdi>{next.name}</bdi>
            <Arrow diagonal />
          </a>
        </div>
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
