<?php

namespace App\Entity;

use App\Repository\UtmVisitRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UtmVisitRepository::class)]
class UtmVisit
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $utmSource;

    #[ORM\Column(length: 255)]
    private string $utmMedium;

    #[ORM\Column(length: 255)]
    private string $utmCampaign;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    public function __construct(
        string $utmSource,
        string $utmMedium,
        string $utmCampaign
    ) {
        $this->utmSource = $utmSource;
        $this->utmMedium = $utmMedium;
        $this->utmCampaign = $utmCampaign;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtmSource(): string
    {
        return $this->utmSource;
    }

    public function getUtmMedium(): string
    {
        return $this->utmMedium;
    }

    public function getUtmCampaign(): string
    {
        return $this->utmCampaign;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
