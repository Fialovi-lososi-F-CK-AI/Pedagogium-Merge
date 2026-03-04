<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/user')]
class UserController
{
    public function __construct(private UserService $userService) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $username (string) = (string) ($data['username'] ?? '');
        $password (string) = (string) ($data['password'] ?? '');

        if ($username === '' || $password === '') {
            return new JsonResponse(['error' => 'Invalid input'], 400);
        }

        $result = $this->userService->register($username, $password);
        return new JsonResponse($result);
    }
}
