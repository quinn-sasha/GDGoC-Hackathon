// スマホかPCかをUAで判定する共通関数
export function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android|Mobile|Windows Phone/i.test(navigator.userAgent);
}
