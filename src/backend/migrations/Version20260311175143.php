<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260311175143 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add ip_address column to utm_visit table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE utm_visit ADD ip_address VARCHAR(45) DEFAULT 'unknown' NOT NULL");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utm_visit DROP ip_address');
    }
}