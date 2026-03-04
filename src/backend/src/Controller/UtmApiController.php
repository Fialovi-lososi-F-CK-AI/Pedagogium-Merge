<?php
namespace App\Controller;

use App\Entity\UtmVisit;
use App\Repository\UtmVisitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/utm')]
class UtmApiController extends AbstractController
{
    public function __construct(private UtmVisitRepository $repo) {}

    #[Route('/track', name: 'utm_track', methods: ['POST'])]
    public function track(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)
            || !isset($data['utm_source'], $data['utm_medium'], $data['utm_campaign'])
        ) {
            return new JsonResponse(['error' => 'Missing UTM parameters'], 400);
        }

        $visit = new UtmVisit(
            (string)$data['utm_source'],
            (string)$data['utm_medium'],
            (string)$data['utm_campaign']
        );

        $this->repo->_em->persist($visit);
        $this->repo->_em->flush();

        return new JsonResponse(['status' => 'ok']);
    }
}
