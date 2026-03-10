<?php

declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\Migrations\Configuration\Connection\ExistingConnection;
use Doctrine\Migrations\Configuration\Migration\PhpFile;
use Doctrine\Migrations\DependencyFactory;
use Doctrine\Migrations\MigratorConfiguration;
use Doctrine\Migrations\Version\Alias;

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

$planCalculator = $dependencyFactory->getMigrationPlanCalculator();
$plan = $planCalculator->getPlanUntilVersion(new Alias('latest'));

$migrator = $dependencyFactory->getMigrator();

$migratorConfiguration = new MigratorConfiguration();
$migratorConfiguration->setDryRun(false);
$migratorConfiguration->setAllOrNothing(false);

$migrator->migrate($plan, $migratorConfiguration);