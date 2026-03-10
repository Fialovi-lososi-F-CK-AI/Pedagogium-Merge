<?php

namespace App\Controller;

use App\Service\ScoreService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use App\Utils\TypeCast;

#[Route('/api/score')]
class ScoreController
{
    public function __construct(
        private ScoreService $scoreService,
        private RateLimiterFactory $scoreSubmitLimiter
    ) {}

    #[Route('/submit', name: 'score_submit', methods: ['POST'])]
    public function submit(Request $request): JsonResponse
    {
        $limit = $this->scoreSubmitLimiter
            ->create($request->getClientIp() ?? 'anon')
            ->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['error' => 'Too many requests'], 429);
        }

        $data = TypeCast::toArray(json_decode($request->getContent(), true));

        $username = TypeCast::toString($data['username'] ?? '');
        $score    = TypeCast::toInt($data['score'] ?? 0);

        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            return new JsonResponse(['error' => 'Invalid username format'], 400);
        }

        if ($score <= 0) {
            return new JsonResponse(['error' => 'Invalid score'], 400);
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
// D:
// :/
