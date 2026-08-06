import os
import re

replacements = [
    # Padding reductions
    (r'\bp-10\b', 'p-5'),
    (r'\bp-12\b', 'p-5'),
    (r'\bp-8\b', 'p-4'),
    (r'\bp-6\b', 'p-4'),
    (r'\bpx-8\b', 'px-4'),
    (r'\bpx-6\b', 'px-4'),
    (r'\bpy-8\b', 'py-4'),
    (r'\bpy-6\b', 'py-3'),
    (r'\bsm:p-8\b', 'sm:p-5'),
    (r'\bsm:p-6\b', 'sm:p-4'),
    (r'\bmd:p-8\b', 'md:p-5'),
    (r'\bmd:p-6\b', 'md:p-4'),

    # Gap / spacing reductions
    (r'\bgap-8\b', 'gap-4'),
    (r'\bgap-6\b', 'gap-3'),
    (r'\bgap-10\b', 'gap-5'),
    (r'\blg:gap-8\b', 'lg:gap-4'),
    (r'\blg:gap-6\b', 'lg:gap-3'),
    (r'\bspace-y-8\b', 'space-y-4'),
    (r'\bspace-y-6\b', 'space-y-3'),
    (r'\bspace-x-8\b', 'space-x-4'),
    (r'\bspace-x-6\b', 'space-x-3'),
    (r'\bspace-y-10\b', 'space-y-5'),

    # Margin reductions
    (r'\bm-8\b', 'm-4'),
    (r'\bm-6\b', 'm-3'),
    (r'\bmb-8\b', 'mb-4'),
    (r'\bmb-6\b', 'mb-3'),
    (r'\bmt-8\b', 'mt-4'),
    (r'\bmt-6\b', 'mt-3'),
    (r'\bmy-8\b', 'my-4'),
    (r'\bmy-6\b', 'my-3'),

    # Remove lingering shadow classes
    (r'\bshadow-sm\b', ''),
    (r'\bshadow-md\b', ''),
    (r'\bshadow-lg\b', ''),
    (r'\bshadow-xl\b', ''),
    (r'\bshadow-2xl\b', ''),
    (r'\bshadow\b', ''),

    # Reduce large border-radius on cards
    (r'\brounded-2xl\b', 'rounded-md'),
    (r'\brounded-xl\b', 'rounded-md'),
    (r'\brounded-lg\b', 'rounded-md'),
]

folders = [
    'apps/web-admin/src',
    'apps/web-vendor/src',
]

extensions = ('.tsx', '.css')

for folder in folders:
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(extensions):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                original = content
                for pattern, repl in replacements:
                    content = re.sub(pattern, repl, content)
                # Clean up double spaces introduced by removing shadows
                content = re.sub(r'  +', ' ', content)
                if content != original:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f'Updated {path}')

print('Done tightening spacing.')
