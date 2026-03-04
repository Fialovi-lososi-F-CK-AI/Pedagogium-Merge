<?php
namespace App\Controller;

use App\Service\ScoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ScoreController extends AbstractController
{
    private ScoreService $service;

    public function __construct(ScoreService $service)
    {
        $this->service = $service;
    }

    #[Route('/score', name: 'score', methods: ['POST'])]
    public function save(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['username'],$data['score'])) {
            return new JsonResponse(['error'=>'Missing data'],400);
        }

        return new JsonResponse($this->service->saveHighscore($data['username'], (int)$data['score']));
    }

    #[Route('/top5', name: 'top5', methods: ['GET'])]
    public function top5(): JsonResponse
    {
        return new JsonResponse($this->service->getTop5());
    }
}
