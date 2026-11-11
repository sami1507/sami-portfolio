/** Validate public build settings. Errors name the setting, never echo its value. */
export function readPublicSettings({ siteUrl = "", resumeUrl = "" } = {}) {
  const origin = siteUrl.trim();
  const resume = resumeUrl.trim();
  let canonicalOrigin = null;
  if (origin) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be a complete HTTPS origin, without a path.",
      );
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    ) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must use HTTPS and contain only the host (no credentials, path, query or fragment).",
      );
    }
    canonicalOrigin = url.origin;
  }
  if (resume) {
    if (resume.startsWith("/")) {
      if (
        !/^\/(?!\/)[A-Za-z0-9_/-]+\.pdf$/.test(resume) ||
        resume.split("/").some((part) => part === "." || part === "..")
      ) {
        throw new Error(
          "NEXT_PUBLIC_RESUME_URL must be a local /filename.pdf path or a complete HTTPS URL.",
        );
      }
    } else {
      let url;
      try {
        url = new URL(resume);
      } catch {
        throw new Error(
          "NEXT_PUBLIC_RESUME_URL must be a local /filename.pdf path or a complete HTTPS URL.",
        );
      }
      if (url.protocol !== "https:" || url.username || url.password) {
        throw new Error(
          "NEXT_PUBLIC_RESUME_URL must use HTTPS without credentials.",
        );
      }
    }
  }
  return {
    siteUrl: canonicalOrigin,
    resume: resume || null,
    configured: Boolean(canonicalOrigin),
  };
}
