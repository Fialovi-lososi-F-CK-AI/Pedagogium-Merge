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
        return base64_encode(
            openssl_encrypt($text, 'AES-256-CBC', $this->key, OPENSSL_RAW_DATA, $this->iv)
        );
    }

    public function decrypt(string $text): string
    {
        $result = openssl_decrypt(
            base64_decode($text),
            'AES-256-CBC',
            $this->key,
            OPENSSL_RAW_DATA,
            $this->iv
        );

        return $result ?: '';
    }
}
