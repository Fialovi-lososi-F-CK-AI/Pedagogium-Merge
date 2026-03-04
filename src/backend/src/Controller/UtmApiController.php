<?php
namespace App\Controller;

use App\Entity\UtmVisit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/utm')]
class UtmApiController
{
    public function __construct(private EntityManagerInterface $em) {}

    #[Route('/track', name: 'utm', methods: ['POST'])]
    public function track(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['utm_source'], $data['utm_medium'], $data['utm_campaign'])) {
            return new JsonResponse(['error' => 'Missing UTM parameters'], 400);
        }

        $visit = new UtmVisit();
        $visit->setUtmSource($data['utm_source']);
        $visit->setUtmMedium($data['utm_medium']);
        $visit->setUtmCampaign($data['utm_campaign']);
        $visit->setCreatedAt(new \DateTimeImmutable());

        $this->em->persist($visit);
        $this->em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
