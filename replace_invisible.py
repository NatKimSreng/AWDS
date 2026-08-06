import re, os, glob

ADMIN_ROOT = r'D:\year4\AWDS\apps\web-admin\src'
VENDOR_ROOT = r'D:\year4\AWDS\apps\web-vendor\src'

REPLACEMENTS = [
    # Primary accent buttons: white bg + dark text
    (r'bg-accent\s+text-white', 'bg-accent text-accent-inverse'),
    (r'text-white\s+.*bg-accent', lambda m: m.group(0).replace('text-white', 'text-accent-inverse')),

    # Input/select backgrounds: bg-white on dark theme → dark surface + light text
    (r'bg-white', 'bg-surface-raised text-text-primary'),

    # Pagination button in vendor BookingsPage had specific pattern
    (r"'bg-white\s+border\s+border-border\s+text-text-secondary\s+hover:bg-surface-elevated'",
     "'bg-surface-raised border border-border text-text-secondary hover:bg-surface-elevated'"),
]

# The above regex is too broad. Let's do a simpler per-file targeted approach using exact strings.

def replace_in_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    original = text
    for old, new in replacements:
        text = text.replace(old, new)
    if text != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        return True
    return False

# Define targeted replacements per file based on grep results
files_replacements = {
    # Admin portal
    os.path.join(ADMIN_ROOT, 'components', 'EmptyState.tsx'): [
        ('bg-accent text-white text-sm font-medium hover:bg-accent', 'bg-accent text-accent-inverse text-sm font-medium hover:bg-accent'),
    ],
    os.path.join(ADMIN_ROOT, 'components', 'ConfirmModal.tsx'): [
        ('text-white', 'text-accent-inverse',), # only occurrence should be in the confirm button line
    ],
    os.path.join(ADMIN_ROOT, 'components', 'ErrorState.tsx'): [
        ('bg-error text-white text-sm font-medium hover:bg-error', 'bg-error text-accent-inverse text-sm font-medium hover:bg-error'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'BookingDetailPage.tsx'): [
        ('bg-success text-white hover:bg-success', 'bg-success text-accent-inverse hover:bg-success'),
        ('bg-accent text-white hover:bg-accent', 'bg-accent text-accent-inverse hover:bg-accent'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'ListingDetailPage.tsx'): [
        ('bg-surface-raised text-white hover:bg-surface-elevated', 'bg-surface-raised text-text-primary hover:bg-surface-elevated'),
        ('bg-accent text-white hover:bg-accent', 'bg-accent text-accent-inverse hover:bg-accent'),
        ('bg-surface-raised text-white text-xs', 'bg-surface-raised text-text-primary text-xs'),
        ('text-white', 'text-text-primary'),  # in the image overlay text
        ('bg-accent text-white text-[10px]', 'bg-accent text-accent-inverse text-[10px]'),
        ('bg-white text-sm', 'bg-surface-raised text-text-primary text-sm'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'PayoutsPage.tsx'): [
        ('bg-accent text-white text-sm', 'bg-accent text-accent-inverse text-sm'),
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'ProviderDetailPage.tsx'): [
        ('bg-success text-white hover:bg-success', 'bg-success text-accent-inverse hover:bg-success'),
        ('bg-error text-white hover:bg-error', 'bg-error text-accent-inverse hover:bg-error'),
        ('bg-surface-raised text-white hover:bg-surface-elevated', 'bg-surface-raised text-text-primary hover:bg-surface-elevated'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'UserDetailPage.tsx'): [
        ('bg-white text-sm', 'bg-surface-raised text-text-primary text-sm'),
        ('bg-gradient-to-br from-accent to-surface-elevated text-white', 'bg-gradient-to-br from-accent to-surface-elevated text-accent-inverse'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'UsersPage.tsx'): [
        ('bg-white text-xs', 'bg-surface-raised text-text-primary text-xs'),
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'BookingsPage.tsx'): [
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'ListingsPage.tsx'): [
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],
    os.path.join(ADMIN_ROOT, 'pages', 'ProvidersPage.tsx'): [
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],

    # Vendor portal
    os.path.join(VENDOR_ROOT, 'pages', 'BookingsPage.tsx'): [
        ('bg-success text-white py-2.5', 'bg-success text-accent-inverse py-2.5'),
        ('bg-error text-white py-2.5', 'bg-error text-accent-inverse py-2.5'),
        ("'bg-white border border-border text-text-secondary hover:bg-surface-elevated'",
         "'bg-surface-raised border border-border text-text-secondary hover:bg-surface-elevated'"),
    ],
    os.path.join(VENDOR_ROOT, 'pages', 'CalendarPage.tsx'): [
        ('bg-accent text-white px-4', 'bg-accent text-accent-inverse px-4'),
        ('w-full bg-accent text-white py-2.5', 'w-full bg-accent text-accent-inverse py-2.5'),
        ("? 'bg-accent text-white border-accent'", "? 'bg-accent text-accent-inverse border-accent'"),
        ('flex-1 bg-accent text-white py-2.5', 'flex-1 bg-accent text-accent-inverse py-2.5'),
        ('bg-white', 'bg-surface-raised text-text-primary'),
    ],
    os.path.join(VENDOR_ROOT, 'pages', 'ListingFormPage.tsx'): [
        ('bg-accent text-white text-xs', 'bg-accent text-accent-inverse text-xs'),
        ('bg-accent text-white text-[10px]', 'bg-accent text-accent-inverse text-[10px]'),
        ('bg-surface/60 text-white', 'bg-surface/60 text-text-primary'),
        ('bg-accent text-white text-xs', 'bg-accent text-accent-inverse text-xs'),
        ('bg-white', 'bg-surface-raised text-text-primary'),
        ('bg-accent text-white px-4', 'bg-accent text-accent-inverse px-4'),
    ],
    os.path.join(VENDOR_ROOT, 'pages', 'ListingsPage.tsx'): [
        ('bg-accent text-white px-4', 'bg-accent text-accent-inverse px-4'),
        ('bg-accent text-white px-4', 'bg-accent text-accent-inverse px-4'),
    ],
    os.path.join(VENDOR_ROOT, 'pages', 'OnboardingPage.tsx'): [
        ('bg-accent text-white font-medium', 'bg-accent text-accent-inverse font-medium'),
        ('bg-success text-white font-medium', 'bg-success text-accent-inverse font-medium'),
    ],
    os.path.join(VENDOR_ROOT, 'pages', 'SettingsPage.tsx'): [
        ('bg-accent text-white flex items-center', 'bg-accent text-accent-inverse flex items-center'),
        ('text-white', 'text-accent-inverse'),  # for Camera/Loader2 icons in avatar
        ('bg-accent text-white px-4', 'bg-accent text-accent-inverse px-4'),
    ],
}

modified = []
for path, reps in files_replacements.items():
    if os.path.exists(path):
        if replace_in_file(path, reps):
            modified.append(path)
            print(f'  Modified: {path}')
    else:
        print(f'  MISSING: {path}')

print(f'\nDone. Modified {len(modified)} files.')
