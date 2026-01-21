(function () {
  const cursorConfig = window.REIMU_CONFIG?.reimu_cursor;
  const randomConfig = cursorConfig?.random;
  if (!cursorConfig?.enable || !randomConfig?.enable) return;

  const defaultFile = randomConfig.files?.default || "正常选择.png";
  const pointerFile = randomConfig.files?.pointer || "链接选择.png";
  const textFile = randomConfig.files?.text || "文本选择.png";
  const sets = Array.isArray(randomConfig.sets)
    ? randomConfig.sets
    : [];
  if (!sets.length) return;

  const basePath = randomConfig.base || "../images/cur/cursor";

  const resolveBase = () => {
    const origin = window.location.origin;
    const root = window.REIMU_CONFIG?.root || "/";
    const baseUrl = new URL(root, origin).href; // ensures origin + site root
    // Resolve configured base (may contain ../) against site root
    return new URL(basePath, baseUrl).href.replace(/\/$/, "");
  };

  const buildUrl = (folder, file) => {
    const safeFolder = encodeURIComponent(folder);
    const safeFile = encodeURIComponent(file);
    return `${resolveBase()}/${safeFolder}/${safeFile}`;
  };

  const applyCursor = (folder) => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const oldDefault = (cs.getPropertyValue("--cursor-default") || "").trim();
    const oldPointer = (cs.getPropertyValue("--cursor-pointer") || "").trim();
    const oldText = (cs.getPropertyValue("--cursor-text") || "").trim();

    const defaultUrl = `url(${buildUrl(folder, defaultFile)})`;
    const pointerUrl = `url(${buildUrl(folder, pointerFile)})`;
    const textUrl = `url(${buildUrl(folder, textFile)})`;

    root.style.setProperty(
      "--cursor-default",
      `${defaultUrl}${oldDefault ? ", " + oldDefault : ", auto"}`
    );
    root.style.setProperty(
      "--cursor-pointer",
      `${pointerUrl}${oldPointer ? ", " + oldPointer : ", pointer"}`
    );
    root.style.setProperty(
      "--cursor-text",
      `${textUrl}${oldText ? ", " + oldText : ", text"}`
    );

    // force cursor refresh on initial load: apply to root/body inline
    root.style.cursor = "var(--cursor-default)";
    if (document.body) {
      document.body.style.cursor = "var(--cursor-default)";
    }
  };

  const preloadImage = (url) => new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } catch {
      resolve(false);
    }
  });

  const validateSet = async (folder) => {
    const urls = [
      buildUrl(folder, defaultFile),
      buildUrl(folder, pointerFile),
      buildUrl(folder, textFile),
    ];
    const results = await Promise.all(urls.map(preloadImage));
    return results.every(Boolean);
  };

  const chooseAndApply = async () => {
    const maxAttempts = sets.length;
    for (let i = 0; i < maxAttempts; i++) {
      const folder = sets[Math.floor(Math.random() * sets.length)];
      if (!folder) break;
      const ok = await validateSet(folder);
      if (ok) {
        applyCursor(folder);
        return true;
      }
    }
    return false;
  };

  const init = () => {
    try {
      chooseAndApply();
    } catch (error) {
      console.error("Failed to apply random cursor", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("pjax:complete", init);
})();
