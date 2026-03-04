<?php
namespace App\Utils;

/**
 * Bezpečně převádí mixed na string nebo int s fallbackem
 *
 * @param mixed $value
 * @param 'string'|'int' $type
 * @param string|int|null $default
 * @return string|int
 */
function cast(mixed $value, string $type, mixed $default = null): string|int
{
    return match($type) {
        'string' => is_scalar($value) ? (string) $value : (string) $default,
        'int' => is_numeric($value) ? (int) $value : (int) $default,
    };
}
