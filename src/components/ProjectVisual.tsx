import { Topography } from "./Icons";
import { copy, type Locale } from "@/data/site";
import { interfaceCopy } from "@/data/interface";
import type { Project } from "@/data/projects";
import { projectPreviews } from "@/data/project-previews";
export function Phone({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`phone ${className}`}>
      <img
        src={src}
        alt={alt}
        width="540"
        height="1200"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
export function ProjectVisual({
  kind,
  locale,
  hero = false,
}: {
  kind: Project["visual"];
  locale: Locale;
  hero?: boolean;
}) {
  const t = copy[locale];
  const ui = interfaceCopy[locale];
  if (kind === "pathy")
    return (
      <div
        className={`project-visual pathy-visual ${hero ? "hero-visual" : ""}`}
      >
        <Topography />
        <div className="visual-topline" dir="ltr">
          <span>
            <span className="tiny-dot" /> PATHY
          </span>
          <span dir="auto">{ui.explore}</span>
        </div>
        <span className="visual-word" aria-hidden="true">
          {ui.beyond}
        </span>
        <div className="phone-composition">
          {hero ? (
            <div className="hero-browser browser-window">
              <div className="browser-bar">
                <span className="window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>TravelScan AI</span>
                <span aria-hidden="true">↗</span>
              </div>
              <img
                src="/images/travelscan.webp"
                width="1440"
                height="700"
                alt={ui.travelAlt}
                decoding="async"
              />
            </div>
          ) : (
            <Phone
              className="phone-back"
              src="/images/pathy-discover.webp"
              alt={ui.discoverAlt}
              priority={hero}
            />
          )}
          <Phone
            className="phone-front"
            src="/images/pathy-map.webp"
            alt={ui.mapAlt}
            priority={hero}
          />
        </div>
        <div className="visual-caption">
          <span className="caption-cross" aria-hidden="true">
            +
          </span>
          <span>{hero ? t.heroCaption : t.actualScreens}</span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    );
  const preview =
    kind === "travel"
      ? {
          src: "/images/travelscan.webp",
          width: 1440,
          height: 700,
          label: "travel-scan-ai.vercel.app",
          alt: ui.travelScreen,
          caption: t.travelCaption,
        }
      : kind === "taskflow"
        ? {
            src: "/images/taskflow.webp",
            width: 1440,
            height: 1000,
            label: "sami1507.github.io/taskflow-kanban",
            alt: ui.taskScreen,
            caption: t.taskflowCaption,
          }
        : {
            ...projectPreviews[kind],
            alt: projectPreviews[kind].alt[locale],
            caption: projectPreviews[kind].caption[locale],
          };
  return (
    <div className={`project-visual browser-visual ${kind}-visual`}>
      <div className="browser-window">
        <div className="browser-bar">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span dir="ltr">{preview.label}</span>
          <span aria-hidden="true">↗</span>
        </div>
        <img
          src={preview.src}
          width={preview.width}
          height={preview.height}
          alt={preview.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="visual-caption">
        <span className="caption-cross" aria-hidden="true">
          +
        </span>
        <span>{preview.caption}</span>
        <span aria-hidden="true">↗</span>
      </div>
    </div>
  );
}
