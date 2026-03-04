<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use function App\Utils\cast;

#[Route('/user')]
class UserController
{
    public function __construct(private UserService $userService) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $data */
        $data = json_decode($request->getContent(), true) ?? [];

        $username = cast($data['username'] ?? null, 'string', '');
        $password = cast($data['password'] ?? null, 'string', '');

        if ($username === '' || $password === '') {
            return new JsonResponse(['error' => 'Invalid input'], 400);
        }

        $result = $this->userService->register($username, $password);
        return new JsonResponse($result);
    }
}
