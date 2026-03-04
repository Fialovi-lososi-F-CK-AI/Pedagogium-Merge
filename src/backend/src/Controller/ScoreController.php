<?php
namespace App\Controller;

use App\Service\ScoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ScoreController extends AbstractController
{
    public function __construct(
        private ScoreService $service
    ) {}

    #[Route('/score', name: 'score', methods: ['POST'])]
    public function save(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        $username = $data['username'] ?? null;
        $score = $data['score'] ?? null;

        if (!is_string($username) || !is_int($score)) {
            return new JsonResponse(['error' => 'Invalid data types'], 400);
        }

        return new JsonResponse(
            $this->service->saveHighscore($username, $score)
        );
    }

    #[Route('/top5', name: 'top5', methods: ['GET'])]
    public function top5(): JsonResponse
    {
        return new JsonResponse(
            $this->service->getTop5()
        );
    }
}
