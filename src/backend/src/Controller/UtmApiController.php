<?php

namespace App\Controller;

use App\Entity\UtmVisit;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use App\Utils\TypeCast;

#[Route('/api/utm')]
class UtmApiController
{
    public function __construct(
        private EntityManagerInterface $em,
        private RateLimiterFactory $utmTrackLimiter
    ) {}

    #[Route('/track', name: 'utm_track', methods: ['POST'])]
    public function track(Request $request): JsonResponse
    {
        $ip = $request->getClientIp() ?? 'unknown';

        $limit = $this->utmTrackLimiter
            ->create($ip)
            ->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['error' => 'Too many requests'], 429);
        }

        $data = TypeCast::toArray(json_decode($request->getContent(), true));

        $source   = TypeCast::toString($data['utm_source'] ?? '');
        $medium   = TypeCast::toString($data['utm_medium'] ?? '');
        $campaign = TypeCast::toString($data['utm_campaign'] ?? '');

        if ($source === '' || $medium === '' || $campaign === '') {
            return new JsonResponse(['error' => 'Invalid UTM parameters'], 400);
        }

        $visit = new UtmVisit($source, $medium, $campaign, $ip);

        $this->em->persist($visit);
        $this->em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}