export function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  } catch (e) {
    return false;
  }
}
