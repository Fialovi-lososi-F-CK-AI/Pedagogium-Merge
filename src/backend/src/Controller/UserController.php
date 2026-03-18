<?php

namespace App\Controller;

use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use App\Service\UsernameValidator;
use App\Utils\TypeCast;

#[Route('/api/user')]
class UserController
{
    public function __construct(
        private UserService $userService,
        private RateLimiterFactory $loginApiLimiter,
        private UsernameValidator $usernameValidator
    ) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $decoded = json_decode($request->getContent(), true);

        if (!is_array($decoded)) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        /** @var array<string, mixed> $data */
        $data = $decoded;

        $username = trim(TypeCast::toString($data['username'] ?? ''));
        $password = TypeCast::toString($data['password'] ?? '');

        $usernameError = $this->usernameValidator->validate($username);

        if ($usernameError !== null) {
            return new JsonResponse(['error' => $usernameError], 400);
        }

        if (strlen($password) < 6) {
            return new JsonResponse(['error' => 'Password too short'], 400);
        }

        $result = $this->userService->register($username, $password);

        if (isset($result['error'])) {
            return new JsonResponse($result, 400);
        }

        $user = $this->userService->getValidUser($username, $password);

        if (!$user) {
            return new JsonResponse([
                'error' => 'Registration succeeded, but auto-login failed'
            ], 500);
        }

        $session = $request->getSession();
        $session->migrate(true);
        $session->set('user_id', $user->getId());
        $session->set('username', $user->getUsername());

        return new JsonResponse([
            'success' => true,
            'message' => 'Registration successful',
            'username' => $user->getUsername()
        ], 201);
    }

    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $limit = $this->loginApiLimiter
            ->create($request->getClientIp() ?? 'anon')
            ->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(['error' => 'Too many requests'], 429);
        }

        $decoded = json_decode($request->getContent(), true);

        if (!is_array($decoded)) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        /** @var array<string, mixed> $data */
        $data = $decoded;

        $username = trim(TypeCast::toString($data['username'] ?? ''));
        $password = TypeCast::toString($data['password'] ?? '');

        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            return new JsonResponse(['error' => 'Invalid username'], 400);
        }

        if ($password === '') {
            return new JsonResponse(['error' => 'Invalid password'], 400);
        }

        $user = $this->userService->getValidUser($username, $password);

        if (!$user) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        $session = $request->getSession();
        $session->migrate(true);
        $session->set('user_id', $user->getId());
        $session->set('username', $user->getUsername());

        return new JsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'username' => $user->getUsername()
        ]);
    }

    #[Route('/me', name: 'user_me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        $userId = $request->getSession()->get('user_id');
        $username = $request->getSession()->get('username');

        if (!$userId || !$username) {
            return new JsonResponse(['authenticated' => false], 401);
        }

        return new JsonResponse([
            'authenticated' => true,
            'username' => $username
        ]);
    }

    #[Route('/logout', name: 'user_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $request->getSession()->invalidate();

        return new JsonResponse(['status' => 'ok']);
    }
}