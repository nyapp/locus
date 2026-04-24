type ElementLike = {
  tagName?: unknown;
  isContentEditable?: unknown;
  getAttribute?: (name: string) => string | null;
  hasAttribute?: (name: string) => boolean;
};

/** 数字キーでリッカート値を選ぶショートカットを抑止すべきか（テキスト入力中など） */
export function blocksSurveyDigitShortcuts(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const element = target as ElementLike;

  if (element.isContentEditable === true) return true;

  const tagName =
    typeof element.tagName === "string" ? element.tagName.toUpperCase() : "";
  if (tagName === "TEXTAREA" || tagName === "SELECT") return true;

  if (tagName === "INPUT") {
    const raw =
      typeof element.getAttribute === "function"
        ? element.getAttribute("type")
        : null;
    const type = (raw ?? "text").trim().toLowerCase();
    // ラジオ等では数字キーで回答を選べるようにし、テキスト系のみブロックする
    const digitNeutralTypes = new Set([
      "radio",
      "checkbox",
      "hidden",
      "button",
      "submit",
      "reset",
      "image",
      "file",
      "color",
      "range",
    ]);
    return !digitNeutralTypes.has(type);
  }

  if (tagName === "BUTTON" || tagName === "A") return true;

  return false;
}

export function isInteractiveShortcutTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const element = target as ElementLike;

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
