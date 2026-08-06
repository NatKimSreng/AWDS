<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use Illuminate\Http\Request;

class AdminAuditService
{
    public function __construct(
        private readonly Request $request
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function log(string $action, ?string $entityType = null, ?int $entityId = null, array $payload = []): AdminAuditLog
    {
        $user = $this->request->user();

        return AdminAuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'payload' => empty($payload) ? null : $payload,
            'ip_address' => $this->request->ip(),
            'created_at' => now(),
        ]);
    }
}
