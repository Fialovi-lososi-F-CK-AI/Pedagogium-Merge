<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Utils\TypeCast;

#[Route('/user')]
class UserController
{
    public function __construct(private UserService $userService) {}

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
        return new JsonResponse($result);
    }

    #[Route('/login', name: 'user_login', methods: ['POST'])]
        public function login(Request $request): JsonResponse
        {
            /** @var array<string, mixed> $data */
            $data = json_decode($request->getContent(), true) ?? [];

            $username = TypeCast::toString($data['username'] ?? '');
            $password = TypeCast::toString($data['password'] ?? '');

            if ($username === '' || $password === '') {
                return new JsonResponse(['error' => 'Invalid input'], 400);
            }

            $user = $this->userService->checkUser($username, $password);

            if (!$user) {
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
