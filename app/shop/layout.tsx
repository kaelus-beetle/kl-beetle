import type { ReactNode } from "react";
import ShopAccessGuard from "./access-guard";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopAccessGuard>{children}</ShopAccessGuard>;
}
