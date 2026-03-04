<?php
namespace App\Service;

class PasswordService
{
    private string $key;
    private string $iv;

    public function __construct()
    {
        $this->key = getenv('AES_KEY') ?: 'defaultkey';
        $this->iv  = getenv('AES_IV') ?: 'defaultiv1234567';
    }

    public function encrypt(string $text): string
    {
        $encrypted = openssl_encrypt($text, 'AES-256-CBC', $this->key, OPENSSL_RAW_DATA, $this->iv);

        if ($encrypted === false) {
            throw new \RuntimeException('Encryption failed.');
        }

        return base64_encode($encrypted);
    }

    public function decrypt(string $text): string
    {
        $decoded = base64_decode($text, true);
        if ($decoded === false) {
            throw new \RuntimeException('Base64 decoding failed.');
        }

        $decrypted = openssl_decrypt($decoded, 'AES-256-CBC', $this->key, OPENSSL_RAW_DATA, $this->iv);

        if ($decrypted === false) {
            throw new \RuntimeException('Decryption failed.');
        }

        return $decrypted;
    }
}
