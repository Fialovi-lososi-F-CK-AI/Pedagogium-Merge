<?php
namespace App\Controller;

use App\Service\ScoreService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Utils\TypeCast;

#[Route('/api/score')]
class ScoreController
{
    public function __construct(private ScoreService $scoreService) {}

    #[Route('/submit', name: 'score_submit', methods: ['POST'])]
    public function submit(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $username = TypeCast::toString($data['username'] ?? '');
        $score    = TypeCast::toInt($data['score'] ?? 0);

        if ($username === '' || $score <= 0) {
            return new JsonResponse(['error' => 'Invalid input'], 400);
        }

        $result = $this->scoreService->saveHighscore($username, $score);
        return new JsonResponse($result);
    }

    #[Route('/top5', name: 'score_top5', methods: ['GET'])]
    public function top5(): JsonResponse
    {
        $scores = $this->scoreService->getTop5();

        $output = array_map(fn($s) => [
            'username' => $s->getUser()->getUsername(),
            'score' => $s->getValue(),
        ], $scores);

        return new JsonResponse($output);
    }
}
// :D
