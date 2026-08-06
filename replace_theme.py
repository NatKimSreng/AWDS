#!/usr/bin/env python3
"""Bulk replace old warm theme tokens with dark grayscale tokens in vendor/admin TSX/TS files."""
import re
from pathlib import Path

REPLACEMENTS: dict[str, str] = {
    # colors
    "text-angkor-orange": "text-text-primary",
    "text-angkor-orange-dark": "text-text-primary",
    "text-angkor-orange-light": "text-text-secondary",
    "text-stone-charcoal": "text-text-primary",
    "text-stone-gray": "text-text-secondary",
    "text-khmer-gold": "text-text-primary",
    "text-card-white": "text-text-primary",
    "text-sand-bg": "text-text-secondary",
    "text-stone-cream": "text-text-secondary",
    "text-success-green": "text-success",
    "text-error-red": "text-error",
    "text-amber-700": "text-warning",

    "bg-angkor-orange": "bg-accent",
    "bg-angkor-orange-dark": "bg-surface-elevated",
    "bg-angkor-orange-light": "bg-surface-elevated",
    "bg-stone-charcoal": "bg-surface",
    "bg-stone-charcoal/40": "bg-black/40",
    "bg-stone-gray": "bg-surface-raised",
    "bg-stone-gray/5": "bg-surface-elevated",
    "bg-stone-gray/10": "bg-surface-elevated",
    "bg-stone-gray/20": "bg-surface-elevated",
    "bg-stone-gray/40": "bg-surface-elevated",
    "bg-stone-gray/70": "bg-surface-elevated",
    "bg-khmer-gold": "bg-surface-raised",
    "bg-card-white": "bg-surface-raised",
    "bg-sand-bg": "bg-surface",
    "bg-stone-cream": "bg-surface-raised",
    "bg-success-green": "bg-success",
    "bg-error-red": "bg-error",
    "bg-error-red/5": "bg-error/10",
    "bg-error-red/10": "bg-error/10",
    "bg-error-red/20": "bg-error/20",
    "bg-amber-100": "bg-warning/10",
    "bg-amber-100/50": "bg-warning/10",
    "bg-blue-100": "bg-surface-elevated",
    "bg-blue-500": "bg-surface-raised",

    "border-stone-gray/10": "border-border",
    "border-stone-gray/20": "border-border",
    "border-stone-gray/30": "border-border",
    "border-angkor-orange": "border-accent",
    "border-angkor-orange/30": "border-accent",
    "border-gyg-border": "border-border",
    "border-error-red": "border-error",
    "border-error-red/20": "border-error",
    "focus:border-angkor-orange": "focus:border-accent",
    "focus:ring-angkor-orange": "focus:ring-accent",
    "focus:ring-angkor-orange/30": "focus:ring-accent",
    "focus:border-error-red": "focus:border-error",
    "focus:ring-error-red": "focus:ring-error",

    "hover:bg-stone-gray/5": "hover:bg-surface-elevated",
    "hover:bg-stone-gray/10": "hover:bg-surface-elevated",
    "hover:bg-stone-gray/20": "hover:bg-surface-elevated",
    "hover:bg-stone-gray/70": "hover:bg-surface-elevated",
    "hover:bg-angkor-orange/10": "hover:bg-surface-elevated",
    "hover:bg-angkor-orange/90": "hover:bg-accent",
    "hover:bg-success-green/90": "hover:bg-success",
    "hover:bg-error-red/20": "hover:bg-error/20",
    "hover:bg-error-red/90": "hover:bg-error",
    "hover:bg-khmer-gold/90": "hover:bg-surface-elevated",
    "hover:bg-khmer-gold/10": "hover:bg-surface-elevated",
    "hover:border-angkor-orange/30": "hover:border-accent",
    "hover:text-angkor-orange": "hover:text-text-primary",
    "hover:text-stone-charcoal": "hover:text-text-primary",
    "hover:text-stone-gray": "hover:text-text-secondary",
    "active:bg-error-red/5": "active:bg-error/10",

    "fill-khmer-gold": "fill-text-primary",
    "stroke-stone-gray/20": "stroke-border",
    "stroke-angkor-orange": "stroke-accent",

    # backgrounds in JSX expressions (e.g. bg={`${condition ? 'bg-angkor-orange' : 'bg-white'}`})
    "'bg-angkor-orange'": "'bg-accent'",
    "'bg-angkor-orange text-white'": "'bg-accent text-accent-inverse'",
    "'bg-stone-gray/10'": "'bg-surface-elevated'",
    "'bg-stone-gray/20'": "'bg-surface-elevated'",
    "'bg-stone-gray/5'": "'bg-surface-elevated'",
    "'bg-success-green'": "'bg-success'",
    "'bg-success-green text-white'": "'bg-success text-white'",
    "'bg-error-red'": "'bg-error'",
    "'bg-error-red text-white'": "'bg-error text-white'",
    "'bg-error-red/10'": "'bg-error/10'",
    "'bg-error-red/20'": "'bg-error/20'",
    "'bg-amber-100'": "'bg-warning/10'",
    "'bg-khmer-gold'": "'bg-surface-raised'",
    "'bg-khmer-gold text-white'": "'bg-surface-raised text-text-primary'",
    "'bg-white'": "'bg-surface'",
    "'bg-card-white'": "'bg-surface-raised'",
    "'bg-sand-bg'": "'bg-surface'",
    "'bg-stone-cream'": "'bg-surface-raised'",

    "'text-angkor-orange'": "'text-text-primary'",
    "'text-stone-charcoal'": "'text-text-primary'",
    "'text-stone-gray'": "'text-text-secondary'",
    "'text-success-green'": "'text-success'",
    "'text-error-red'": "'text-error'",
    "'text-amber-700'": "'text-warning'",
    "'text-khmer-gold'": "'text-text-primary'",

    "'border-stone-gray/10'": "'border-border'",
    "'border-stone-gray/20'": "'border-border'",
    "'border-angkor-orange'": "'border-accent'",
    "'border-gyg-border'": "'border-border'",
    "'border-error-red'": "'border-error'",

    "'hover:bg-stone-gray/5'": "'hover:bg-surface-elevated'",
    "'hover:bg-stone-gray/10'": "'hover:bg-surface-elevated'",
    "'hover:bg-stone-gray/20'": "'hover:bg-surface-elevated'",
    "'hover:bg-angkor-orange/10'": "'hover:bg-surface-elevated'",
    "'hover:bg-angkor-orange/90'": "'hover:bg-accent'",
    "'hover:bg-success-green/90'": "'hover:bg-success'",
    "'hover:bg-error-red/20'": "'hover:bg-error/20'",
    "'hover:bg-error-red/90'": "'hover:bg-error'",
    "'hover:bg-khmer-gold/90'": "'hover:bg-surface-elevated'",
    "'hover:bg-khmer-gold/10'": "'hover:bg-surface-elevated'",
    "'hover:text-angkor-orange'": "'hover:text-text-primary'",
    "'hover:text-stone-charcoal'": "'hover:text-text-primary'",

    "'focus:border-angkor-orange'": "'focus:border-accent'",
    "'focus:ring-angkor-orange'": "'focus:ring-accent'",
    "'focus:border-error-red'": "'focus:border-error'",
    "'focus:ring-error-red'": "'focus:ring-error'",

    # radius / shadows
    "rounded-xl": "rounded-md",
    "rounded-2xl": "rounded-lg",
    "rounded-3xl": "rounded-lg",
    "shadow-sm": "",
    "shadow-md": "",
    "shadow-lg": "",
    "shadow-card": "",
    "shadow-xl": "",
}


def longest_first(d: dict) -> dict:
    return dict(sorted(d.items(), key=lambda kv: len(kv[0]), reverse=True))


REPL = longest_first(REPLACEMENTS)


def process_file(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    text = original
    for old, new in REPL.items():
        if old in text:
            text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return 1
    return 0


def main():
    base = Path("D:/year4/AWDS/apps")
    dirs = [base / "web-vendor/src", base / "web-admin/src"]
    changed = 0
    for d in dirs:
        for f in d.rglob("*.tsx"):
            changed += process_file(f)
        for f in d.rglob("*.ts"):
            if f.name.endswith((".d.ts",)):
                continue
            changed += process_file(f)
    print(f"Modified {changed} files.")


if __name__ == "__main__":
    main()
