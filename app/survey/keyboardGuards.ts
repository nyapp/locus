export function isInteractiveShortcutTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const element = target as {
    tagName?: unknown;
    isContentEditable?: unknown;
    getAttribute?: (name: string) => string | null;
    hasAttribute?: (name: string) => boolean;
  };

  if (element.isContentEditable === true) return true;

  const tagName =
    typeof element.tagName === "string" ? element.tagName.toUpperCase() : "";
  if (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    tagName === "BUTTON" ||
    tagName === "A"
  ) {
    return true;
  }

  const role =
    typeof element.getAttribute === "function"
      ? element.getAttribute("role")
      : null;
  if (role === "button") return true;

  // tabindex が付いた要素はキーボード操作対象として扱う。
  if (
    typeof element.hasAttribute === "function" &&
    element.hasAttribute("tabindex")
  ) {
    return true;
  }

  return false;
}
