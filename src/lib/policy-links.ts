import { POLICY_PAGES } from "./policy-defaults";

export const POLICY_NAV_LINKS = POLICY_PAGES.map((p) => ({
  href: p.href,
  label: p.title,
}));
