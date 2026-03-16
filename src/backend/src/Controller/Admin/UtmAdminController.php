<?php

namespace App\Controller\Admin;

use App\Repository\UtmVisitRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/utm')]
class UtmAdminController
{
    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(UtmVisitRepository $repo): JsonResponse
    {
        /** @var list<array{utmSource: string, visits: string|int, uniqueIps: string|int}> $bySource */
        $bySource = $repo->createQueryBuilder('u')
            ->select('u.utmSource AS utmSource, COUNT(u.id) AS visits, COUNT(DISTINCT u.ipAddress) AS uniqueIps')
            ->groupBy('u.utmSource')
            ->orderBy('visits', 'DESC')
            ->getQuery()
            ->getResult();

        /** @var array{totalVisits: string|int, totalUniqueIps: string|int}|null $totals */
        $totals = $repo->createQueryBuilder('u')
            ->select('COUNT(u.id) AS totalVisits, COUNT(DISTINCT u.ipAddress) AS totalUniqueIps')
            ->getQuery()
            ->getOneOrNullResult();

        /** @var list<array{utmSource: string, visits: int, uniqueIps: int}> $normalizedBySource */
        $normalizedBySource = [];

        foreach ($bySource as $row) {
            $normalizedBySource[] = [
                'utmSource' => $row['utmSource'],
                'visits' => (int) $row['visits'],
                'uniqueIps' => (int) $row['uniqueIps'],
            ];
        }

        return new JsonResponse([
            'totals' => [
                'totalVisits' => (int) ($totals['totalVisits'] ?? 0),
                'totalUniqueIps' => (int) ($totals['totalUniqueIps'] ?? 0),
            ],
            'bySource' => $normalizedBySource,
        ]);
    }
}