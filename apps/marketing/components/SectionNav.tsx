"use client";

import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: NavItem[];
}

export default function SectionNav({ items }: SectionNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          return;
        }
      }
      setActiveId(items[0]?.id ?? "");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  return (
    <nav className="sticky top-16 z-30 bg-white border-b border-gyg-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar py-3">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`whitespace-nowrap text-sm font-semibold transition ${
                  isActive
                    ? "text-gyg-navy border-b-2 border-gyg-navy pb-3"
                    : "text-gyg-muted hover:text-gyg-text pb-3"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
