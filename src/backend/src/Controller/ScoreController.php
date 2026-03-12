<?php

namespace App\Controller;

use App\Service\ScoreService;
use App\Service\UserService;
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
        private UserService $userService,
        private RateLimiterFactory $scoreSubmitLimiter
    ) {}

    #[Route('/start', name: 'score_start', methods: ['POST'])]
    public function start(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $userId = $session->get('user_id');

        if (!$userId) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $token = bin2hex(random_bytes(32));

        $activeGames = $session->get('active_game_tokens', []);
        $activeGames[$token] = [
            'started_at' => time(),
            'used' => false,
            'ip' => $request->getClientIp(),
            'ua' => substr((string) $request->headers->get('User-Agent'), 0, 255),
        ];

        $session->set('active_game_tokens', $activeGames);

        return new JsonResponse([
            'gameToken' => $token,
        ]);
    }

    #[Route('/submit', name: 'score_submit', methods: ['POST'])]
    public function submit(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $userId = $session->get('user_id');

        if (!$userId) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $limit = $this->scoreSubmitLimiter
            ->create($request->getClientIp() ?? 'anon')
            ->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['error' => 'Too many requests'], 429);
        }

        $data = TypeCast::toArray(json_decode($request->getContent(), true));

        $gameToken = TypeCast::toString($data['gameToken'] ?? '');
        $score = TypeCast::toInt($data['score'] ?? 0);

        if ($gameToken === '') {
            return new JsonResponse(['error' => 'Missing game token'], 400);
        }

        if ($score <= 0 || $score > 1000000) {
            return new JsonResponse(['error' => 'Invalid score'], 400);
        }

        $activeGames = $session->get('active_game_tokens', []);
        $game = $activeGames[$gameToken] ?? null;

        if (!$game) {
            return new JsonResponse(['error' => 'Invalid game token'], 400);
        }

        if (($game['used'] ?? false) === true) {
            return new JsonResponse(['error' => 'Game token already used'], 400);
        }

        $startedAt = (int) ($game['started_at'] ?? 0);
        $duration = time() - $startedAt;

        if ($startedAt <= 0 || $duration < 5) {
            return new JsonResponse(['error' => 'Game session too short'], 400);
        }

        if ($duration > 7200) {
            return new JsonResponse(['error' => 'Game session expired'], 400);
        }

        $user = $this->userService->findById((int) $userId);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $result = $this->scoreService->saveHighscoreForUser($user, $score);

        $activeGames[$gameToken]['used'] = true;
        $activeGames[$gameToken]['submitted_at'] = time();
        $activeGames[$gameToken]['submitted_score'] = $score;
        $session->set('active_game_tokens', $activeGames);

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