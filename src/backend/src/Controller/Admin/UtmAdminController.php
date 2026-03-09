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
        $data = $repo->createQueryBuilder('u')
            ->select('u.utmSource, COUNT(u.id) as visits')
            ->groupBy('u.utmSource')
            ->getQuery()
            ->getResult();

        return new JsonResponse($data);
    }
}
