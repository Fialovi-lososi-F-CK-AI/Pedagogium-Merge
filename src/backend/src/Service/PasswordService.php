<?php
namespace App\Service;

class PasswordService
{
    private string $key;
    private string $iv;

    public function __construct()
    {
        $this->key = getenv('AES_KEY') ?: 'defaultkey';
        $this->iv  = getenv('AES_IV') ?: 'defaultiv123456789012345678'; // 32B for AES-256-CBC
    }

    public function encrypt(string $text): string
    {
        $result = openssl_encrypt($text, 'AES-256-CBC', $this->key, OPENSSL_RAW_DATA, $this->iv);
        if ($result === false) throw new \RuntimeException('Encryption failed');
        return base64_encode($result);
    }

    public function decrypt(string $text): string
    {
        $decoded = base64_decode($text, true);
        if ($decoded === false) throw new \RuntimeException('Invalid base64 string');
        $result = openssl_decrypt($decoded, 'AES-256-CBC', $this->key, OPENSSL_RAW_DATA, $this->iv);
        if ($result === false) throw new \RuntimeException('Decryption failed');
        return $result;
    }
}
