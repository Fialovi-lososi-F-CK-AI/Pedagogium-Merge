<?php
namespace App\Controller;

use App\Entity\UtmVisit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/utm')]
class UtmApiController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('/track', name: 'utm', methods: ['POST'])]
    public function track(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) return new JsonResponse(['error'=>'Invalid JSON'],400);

        $source = $data['utm_source'] ?? null;
        $medium = $data['utm_medium'] ?? null;
        $campaign = $data['utm_campaign'] ?? null;

        if (!is_string($source) || !is_string($medium) || !is_string($campaign)) {
            return new JsonResponse(['error'=>'Invalid UTM parameters'],400);
        }

        $visit = new UtmVisit();
        $visit->setUtmSource($source)
              ->setUtmMedium($medium)
              ->setUtmCampaign($campaign)
              ->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($visit);
        $this->em->flush();

        return new JsonResponse(['status'=>'ok']);
    }
}
