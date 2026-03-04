<?php
namespace App\Controller;

use App\Service\ScoreService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/score')]
class ScoreController extends AbstractController
{
    public function __construct(private ScoreService $service) {}

    #[Route('', name: 'score_save', methods: ['POST'])]
    public function save(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['username'], $data['score'])) {
            return new JsonResponse(['error' => 'Missing data'], 400);
        }

        $username = (string) $data['username'];
        $score = (int) $data['score'];

        return new JsonResponse($this->service->saveHighscore($username, $score));
    }

    #[Route('/top5', name: 'score_top5', methods: ['GET'])]
    public function top5(): JsonResponse
    {
        return new JsonResponse($this->service->getTop5());
    }
}
