<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\Migrations\Configuration\Connection\ExistingConnection;
use Doctrine\Migrations\Configuration\Migration\PhpFile;
use Doctrine\Migrations\DependencyFactory;
use Doctrine\Migrations\MigratorConfiguration;

$databaseUrl = getenv('DATABASE_URL');

if (!$databaseUrl) {
    throw new RuntimeException('DATABASE_URL is not set.');
}

$connection = DriverManager::getConnection([
    'driver' => 'pdo_pgsql',
    'url' => $databaseUrl,
]);

$config = new PhpFile(__DIR__ . '/migrations.php');

$dependencyFactory = DependencyFactory::fromConnection(
    $config,
    new ExistingConnection($connection)
);

$dependencyFactory->getMetadataStorage()->ensureInitialized();

$version = $dependencyFactory
    ->getVersionAliasResolver()
    ->resolveVersionAlias('latest');

$plan = $dependencyFactory
    ->getMigrationPlanCalculator()
    ->getPlanUntilVersion($version);

$migratorConfiguration = new MigratorConfiguration();
$migratorConfiguration->setDryRun(false);
$migratorConfiguration->setAllOrNothing(false);

$dependencyFactory
    ->getMigrator()
    ->migrate($plan, $migratorConfiguration);