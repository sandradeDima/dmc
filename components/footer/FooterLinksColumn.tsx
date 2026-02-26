"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type FooterLinkItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type FooterLinksColumnProps = {
  title?: string;
  links: FooterLinkItem[];
  className?: string;
};

export default function FooterLinksColumn({
  title,
  links,
  className = "",
}: FooterLinksColumnProps) {
  return (
    <div className={className}>
      {title ? (
        <h3 className="text-[24px] font-medium leading-none text-white/95 sm:text-[30px] lg:text-[36px]">
          {title}
        </h3>
      ) : null}

      <ul className="mt-3 space-y-2.5 sm:space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-3 text-[15px] text-white/90 transition-colors hover:text-white sm:text-[17px] lg:text-[18px]"
            >
              <span className="text-white/90 transition-colors group-hover:text-white">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
