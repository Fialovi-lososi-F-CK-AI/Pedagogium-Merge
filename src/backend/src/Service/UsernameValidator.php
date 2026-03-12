<?php

namespace App\Service;

class UsernameValidator
{
    /** @var string[] */
    private array $reservedNames = [];

    /** @var string[] */
    private array $blockedWords = [];

    private string $basePath;

    public function __construct()
    {
        $this->basePath = dirname(__DIR__, 2) . '/config/username_filter';
        $this->reservedNames = $this->loadWordList($this->basePath . '/reserved_names.txt');
        $this->blockedWords = array_merge(
            $this->loadWordList($this->basePath . '/custom_blocked.txt'),
            $this->loadProfanityDirectory($this->basePath . '/profanity')
        );
    }

    public function validate(string $username): ?string
    {
        $raw = trim($username);

        if ($raw === '') {
            return 'Username is required';
        }

        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $raw)) {
            return 'Invalid username format';
        }

        if (str_starts_with(strtolower($raw), 'guest_')) {
            return 'Guest_ prefix is reserved';
        }

        $normalized = $this->normalizeAggressive($raw);

        foreach ($this->reservedNames as $name) {
            if ($this->normalizeAggressive($name) === $normalized) {
                return 'This username is reserved';
            }
        }

        foreach ($this->blockedWords as $word) {
            $bad = $this->normalizeAggressive($word);

            if ($bad !== '' && strlen($bad) >= 3 && str_contains($normalized, $bad)) {
                return 'Username contains forbidden word';
            }
        }

        return null;
    }

    public function normalizeAggressive(string $value): string
    {
        $value = trim(mb_strtolower($value, 'UTF-8'));

        $transliterated = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
        if ($transliterated !== false) {
            $value = $transliterated;
        }

        $map = [
            '0' => 'o',
            '1' => 'i',
            '!' => 'i',
            '|' => 'i',
            '3' => 'e',
            '4' => 'a',
            '@' => 'a',
            '5' => 's',
            '$' => 's',
            '7' => 't',
            '8' => 'b',
            '9' => 'g',
        ];

        $value = strtr($value, $map);

        $value = preg_replace('/[^a-z0-9]/', '', $value) ?? '';

        $value = preg_replace('/(.)\\1{2,}/', '$1$1', $value) ?? '';

        return $value;
    }

    /**
     * @return string[]
     */
    private function loadProfanityDirectory(string $dir): array
    {
        if (!is_dir($dir)) {
            return [];
        }

        $words = [];
        $files = glob($dir . '/*.txt') ?: [];

        foreach ($files as $file) {
            $words = array_merge($words, $this->loadWordList($file));
        }

        return array_values(array_unique($words));
    }

    /**
     * @return string[]
     */
    private function loadWordList(string $file): array
    {
        if (!is_file($file)) {
            return [];
        }

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return [];
        }

        $result = [];

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $result[] = $line;
        }

        return array_values(array_unique($result));
    }
}