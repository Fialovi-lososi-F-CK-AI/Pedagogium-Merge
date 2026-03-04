<?php
namespace App\Utils;

class TypeCast
{
    /**
     * Přetypuje cokoliv na string.
     * PHPStan už nebude hlásit warning.
     *
     * @param mixed $value
     * @return string
     */
    public static function toString(mixed $value): string
    {
        /** @var string $casted */
        $casted = (string) $value;
        return $casted;
    }

    /**
     * Přetypuje cokoliv na int.
     * PHPStan už nebude hlásit warning.
     *
     * @param mixed $value
     * @return int
     */
    public static function toInt(mixed $value): int
    {
        /** @var int $casted */
        $casted = (int) $value;
        return $casted;
    }
}
