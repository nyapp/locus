import { describe, expect, it } from "vitest";
import { isInteractiveShortcutTarget } from "./keyboardGuards";

type MockElement = {
  tagName?: string;
  isContentEditable?: boolean;
  getAttribute?: (name: string) => string | null;
  hasAttribute?: (name: string) => boolean;
};

function createElement(tagName: string, attrs?: Record<string, string>): MockElement {
  return {
    tagName,
    isContentEditable: false,
    getAttribute: (name) => attrs?.[name] ?? null,
    hasAttribute: (name) => Boolean(attrs && name in attrs),
  };
}

describe("isInteractiveShortcutTarget", () => {
  it("リンク・ボタン・入力系要素を true にする", () => {
    expect(isInteractiveShortcutTarget(createElement("a") as EventTarget)).toBe(true);
    expect(isInteractiveShortcutTarget(createElement("button") as EventTarget)).toBe(
      true,
    );
    expect(isInteractiveShortcutTarget(createElement("input") as EventTarget)).toBe(
      true,
    );
    expect(isInteractiveShortcutTarget(createElement("textarea") as EventTarget)).toBe(
      true,
    );
    expect(isInteractiveShortcutTarget(createElement("select") as EventTarget)).toBe(
      true,
    );
  });

  it("role=button と tabindex 要素を true にする", () => {
    expect(
      isInteractiveShortcutTarget(
        createElement("div", { role: "button" }) as EventTarget,
      ),
    ).toBe(true);
    expect(
      isInteractiveShortcutTarget(
        createElement("div", { tabindex: "0" }) as EventTarget,
      ),
    ).toBe(true);
  });

  it("通常の非インタラクティブ要素は false", () => {
    expect(isInteractiveShortcutTarget(createElement("div") as EventTarget)).toBe(false);
    expect(isInteractiveShortcutTarget({ isContentEditable: true } as EventTarget)).toBe(
      true,
    );
    expect(isInteractiveShortcutTarget(null)).toBe(false);
  });
});
