<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use App\Utils\TypeCast;

#[Route('/api/user')]
class UserController
{
    public function __construct(
        private UserService $userService,
        private RateLimiterFactory $loginApiLimiter
    ) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $username = TypeCast::toString($data['username'] ?? '');
        $password = TypeCast::toString($data['password'] ?? '');

        if ($username === '' || $password === '') {
            return new JsonResponse(['error' => 'Invalid input'], 400);
        }

        $result = $this->userService->register($username, $password);

        if (isset($result['error'])) {
            return new JsonResponse($result, 400);
        }

        return new JsonResponse($result, 201);
    }

    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $limiter = $this->loginApiLimiter->create($request->getClientIp() ?? 'anon');
        $limit = $limiter->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['error' => 'Too many requests'], 429);
        }

        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $username = TypeCast::toString($data['username'] ?? '');
        $password = TypeCast::toString($data['password'] ?? '');

        if ($username === '' || $password === '') {
            return new JsonResponse(['error' => 'Invalid input'], 400);
        }

        $isValid = $this->userService->checkUser($username, $password);

        if (!$isValid) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        return new JsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'username' => $username
        ]);
    }
}
