<?php
namespace App\Utils;

/**
 * Bezpečně převádí mixed na string nebo int s fallbackem
 *
 * @param mixed $value
 * @param 'string'|'int'|'float' $type
 * @param string|int|float|null $default
 * @return string|int|float
 */
function cast(mixed $value, string $type, mixed $default = null): mixed
{
    return match($type) {
        'string' => is_scalar($value) ? (string) $value : (string) $default,
        'int' => is_numeric($value) ? (int) $value : (int) $default,
        'float' => is_numeric($value) ? (float) $value : (float) $default,
        default => $default,
    };
}
