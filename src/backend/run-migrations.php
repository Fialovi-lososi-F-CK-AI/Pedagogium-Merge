<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\Migrations\Configuration\Connection\ExistingConnection;
use Doctrine\Migrations\Configuration\Migration\PhpFile;
use Doctrine\Migrations\DependencyFactory;

$databaseUrl = getenv('DATABASE_URL');

if (!$databaseUrl) {
    throw new RuntimeException('DATABASE_URL is not set.');
}

$connection = DriverManager::getConnection([
    'url' => $databaseUrl,
]);

$config = new PhpFile(__DIR__ . '/migrations.php');

$dependencyFactory = DependencyFactory::fromConnection(
    $config,
    new ExistingConnection($connection)
);

$dependencyFactory->getMigrator()->migrate();