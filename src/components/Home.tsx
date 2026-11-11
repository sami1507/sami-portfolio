import { copy, profile, projectPath, type Locale } from "@/data/site";
import { projects } from "@/data/projects";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Contact } from "./Contact";
import { Arrow } from "./Icons";
import { ProjectVisual } from "./ProjectVisual";
import { interfaceCopy } from "@/data/interface";

export function Home({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const ui = interfaceCopy[locale];
  const featured = projects[0];
  const groups = [
    {
      n: "01",
      title: "Android",
      list: ["Kotlin", "Jetpack Compose", "Room", "WorkManager"],
      slug: "pathy",
      project: "PATHY",
    },
    {
      n: "02",
      title: ui.web,
      list: ["TypeScript", "Next.js", "React", "CSS"],
      slug: "travelscan-ai",
      project: "TravelScan AI",
    },
    {
      n: "03",
      title: ui.ai,
      list: ["OpenAI API", "Zod", "Git"],
      slug: "travelscan-ai",
      project: "TravelScan AI",
    },
  ];
  return (
    <>
      <Header locale={locale} />
      <main id="main" tabIndex={-1}>
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-intro">
              <span className="tiny-dot" />
              {t.intro}
            </p>
            <p className="hero-role">
              {t.role} <span aria-hidden="true">/</span>{" "}
              <span dir="ltr">Android · Web · AI</span>
            </p>
            <h1 id="hero-title">
              <span>{t.heroA}</span>
              <span>
                <em>{t.heroB}</em>
              </span>
              <span>{t.heroC}</span>
            </h1>
            <p className="hero-description">{t.heroDescription}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                {t.viewWork}
                <Arrow diagonal />
              </a>
              <a className="text-link" href="#contact">
                {t.getInTouch}
                <Arrow />
              </a>
              {profile.resume && <a href={profile.resume}>{t.resume}</a>}
            </div>
          </div>
          <div className="hero-art">
            <ProjectVisual kind="pathy" locale={locale} hero />
            <div className="art-note">
              <span className="note-line" />
              {t.artNote}
            </div>
          </div>
        </section>
        <div className="container hero-bottom">
          <p>
            <span aria-hidden="true">↓</span>
            {t.scroll}
          </p>
          <span>{ui.motto}</span>
        </div>
        <div className="discipline-band">
          <div className="container discipline-inner">
            {t.disciplines.map((d, i) => (
              <span key={d}>
                <span className="discipline-symbol" aria-hidden="true">
                  {["↗", "⌘", "✳"][i]}
                </span>
                {d}
              </span>
            ))}
            <span className="band-signature" aria-hidden="true">
              S / A
            </span>
          </div>
        </div>
        <section
          className="section work-section container"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.workEyebrow}</p>
              <h2 id="work-title">{t.workTitle}</h2>
            </div>
            <p>{t.workDescription}</p>
          </div>
          <article className="featured-project">
            <div className="featured-copy">
              <p className="project-number">
                01 <span>/ {featured.category[locale]}</span>
              </p>
              <p className="status">
                <span className="tiny-dot" />
                {featured.status[locale]}
              </p>
              <h3>
                <bdi>PATHY</bdi>
                <span>{t.pathyFeature}</span>
              </h3>
              <p className="project-description">{t.pathyDetail}</p>
              <p className="project-role">
                <span>{t.roleLabel}</span> {featured.role[locale]}
              </p>
              <ul className="tags">
                {featured.stack.slice(0, 4).map((tag) => (
                  <li key={tag} dir="ltr">
                    {tag}
                  </li>
                ))}
              </ul>
              <a
                className="button button-outline"
                href={projectPath(locale, featured.slug)}
              >
                {t.caseStudy}
                <Arrow diagonal />
              </a>
              <a className="source-link" href={featured.github}>
                GitHub <Arrow diagonal />
              </a>
            </div>
            <a
              className="visual-link"
              href={projectPath(locale, featured.slug)}
            >
              <span className="sr-only">{t.caseStudy} — PATHY. </span>
              <ProjectVisual kind="pathy" locale={locale} />
            </a>
          </article>
          <div className="project-grid">
            {projects.slice(1).map((project) => (
              <article className="project-card" key={project.slug}>
                <a
                  className="visual-link"
                  href={projectPath(locale, project.slug)}
                >
                  <span className="sr-only">
                    {t.caseStudy} — {project.name}.{" "}
                  </span>
                  <ProjectVisual kind={project.visual} locale={locale} />
                </a>
                <div className="card-meta">
                  <span className="project-number">
                    {project.number} / {project.category[locale]}
                  </span>
                  <span className="status">{project.status[locale]}</span>
                </div>
                <a
                  className="project-title-link"
                  href={projectPath(locale, project.slug)}
                >
                  <h3>
                    <bdi>{project.name}</bdi>
                  </h3>
                  <span className="round-arrow">
                    <Arrow diagonal />
                  </span>
                </a>
                <p className="project-description">{project.summary[locale]}</p>
                <p className="project-role">
                  <span>{t.roleLabel}</span> {project.role[locale]}
                </p>
                <ul className="tags">
                  {project.stack.slice(0, 3).map((tag) => (
                    <li key={tag} dir="ltr">
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="card-links">
                  <a href={projectPath(locale, project.slug)}>
                    {t.caseStudy}
                    <Arrow />
                  </a>
                  <a href={project.github}>
                    GitHub
                    <Arrow diagonal />
                  </a>
                  {project.live && (
                    <a href={project.live}>
                      {t.live}
                      <Arrow diagonal />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div>
              <p className="eyebrow">{t.aboutEyebrow}</p>
              <h2 className="multiline">{t.aboutTitle}</h2>
              <div className="signature" dir="ltr" aria-hidden="true">
                Sami<span>↗</span>
              </div>
            </div>
            <div className="about-copy">
              <p className="about-lead">{t.aboutText}</p>
              <p>{t.aboutText2}</p>
              <ol className="approach-list">
                {t.approach.map((line, i) => (
                  <li key={line}>
                    <span dir="ltr">0{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <section className="section container skills-section" id="skills">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.skillsEyebrow}</p>
              <h2 className="multiline">{t.skillsTitle}</h2>
            </div>
            <span className="section-flower" aria-hidden="true">
              ✳
            </span>
          </div>
          <div className="skills-grid">
            {groups.map((group) => (
              <article key={group.n} className="skill-group">
                <span className="project-number">{group.n}</span>
                <h3 dir="ltr">{group.title}</h3>
                <ul>
                  {group.list.map((skill) => (
                    <li key={skill}>
                      <bdi>{skill}</bdi>
                    </li>
                  ))}
                </ul>
                <a href={projectPath(locale, group.slug)}>
                  {t.evidence} <bdi>{group.project}</bdi>
                  <Arrow diagonal />
                </a>
              </article>
            ))}
          </div>
        </section>
        <p className="container toolkit-note">{t.toolkitNote}</p>
        <section className="learning-section container">
          <p className="eyebrow">{t.learningEyebrow}</p>
          <div className="learning-grid">
            <h2>{t.learningTitle}</h2>
            <div>
              <h3>{t.degree}</h3>
              <p>{t.school}</p>
              <p className="education-date">{t.dates}</p>
              <p className="learning-note">{t.learningText}</p>
            </div>
          </div>
        </section>
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
