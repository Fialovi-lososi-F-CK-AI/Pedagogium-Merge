<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\UtmVisitRepository;

#[ORM\Entity(repositoryClass: UtmVisitRepository::class)]
class UtmVisit
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $utmSource;

    #[ORM\Column(length: 255)]
    private string $utmMedium;

    #[ORM\Column(length: 255)]
    private string $utmCampaign;

    #[ORM\Column(length: 45)]
    private string $ipAddress;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct(string $utmSource = '', string $utmMedium = '', string $utmCampaign = '', string $ipAddress = '')
    {
        $this->utmSource = $utmSource;
        $this->utmMedium = $utmMedium;
        $this->utmCampaign = $utmCampaign;
        $this->ipAddress = $ipAddress;
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

    public function setUtmSource(string $utmSource): self
    {
        $this->utmSource = $utmSource;
        return $this;
    }

    public function getUtmMedium(): string
    {
        return $this->utmMedium;
    }

    public function setUtmMedium(string $utmMedium): self
    {
        $this->utmMedium = $utmMedium;
        return $this;
    }

    public function getUtmCampaign(): string
    {
        return $this->utmCampaign;
    }

    public function setUtmCampaign(string $utmCampaign): self
    {
        $this->utmCampaign = $utmCampaign;
        return $this;
    }

    public function getIpAddress(): string
    {
        return $this->ipAddress;
    }

    public function setIpAddress(string $ipAddress): self
    {
        $this->ipAddress = $ipAddress;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
}