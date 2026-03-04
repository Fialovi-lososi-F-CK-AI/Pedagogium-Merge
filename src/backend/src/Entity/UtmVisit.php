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
    private ?string $utm_source = null;

    #[ORM\Column(length: 255)]
    private ?string $utm_medium = null;

    #[ORM\Column(length: 255)]
    private ?string $utm_campaign = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUtmSource(): ?string
    {
        return $this->utm_source;
    }

    public function setUtmSource(string $utm_source): static
    {
        $this->utm_source = $utm_source;

        return $this;
    }

    public function getUtmMedium(): ?string
    {
        return $this->utm_medium;
    }

    public function setUtmMedium(string $utm_medium): static
    {
        $this->utm_medium = $utm_medium;

        return $this;
    }

    public function getUtmCampaign(): ?string
    {
        return $this->utm_campaign;
    }

    public function setUtmCampaign(string $utm_campaign): static
    {
        $this->utm_campaign = $utm_campaign;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }
}
