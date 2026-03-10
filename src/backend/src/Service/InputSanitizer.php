<?php

namespace App\Service;

class InputSanitizer
{
    public function sanitizeString(string $value): string
    {
        return trim(strip_tags($value));
    }

    public function sanitizeUsername(string $username): string
    {
        return preg_replace('/[^a-zA-Z0-9_]/', '', $username);
    }
}
