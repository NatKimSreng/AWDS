<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageUploadService
{
    /**
     * Store an uploaded image on the public disk and return a public URL.
     *
     * @param UploadedFile $file
     * @param string $directory Directory relative to storage/app/public
     * @return string Public URL of the stored file
     */
    public function store(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');

        return Storage::disk('public')->url($path);
    }

    /**
     * @param array<int, UploadedFile> $files
     * @return array<int, string>
     */
    public function storeMany(array $files, string $directory): array
    {
        $urls = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $urls[] = $this->store($file, $directory);
            }
        }

        return $urls;
    }
}
