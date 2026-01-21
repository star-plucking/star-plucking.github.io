(function () {
  const welcome = "欢迎来到幻想乡";
  const away = "潜藏于黑暗中ᗜ_ᗜ";
  const sep = " ｜";

  const cleanBase = (title) => {
    let t = title;
    t = t.replace(new RegExp(`${sep}${welcome}$`), "");
    if (t === away) t = "";
    t = t.replace(new RegExp(`^${away}${sep}?`), "");
    return t;
  };

  let baseTitle = cleanBase(document.title);

  const applyWelcome = () => {
    const prefix = baseTitle || document.title;
    document.title = `${cleanBase(prefix)}${sep}${welcome}`;
  };

  const handleVisibility = () => {
    if (document.hidden) {
      document.title = away;
    } else {
      applyWelcome();
    }
  };

  const init = () => {
    baseTitle = cleanBase(document.title);
    applyWelcome();
    document.removeEventListener("visibilitychange", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // Re-apply after PJAX navigations
  document.addEventListener("pjax:complete", init);
})();
