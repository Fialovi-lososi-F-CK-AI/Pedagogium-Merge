<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    public function __construct(
        private UserService $service
    ) {}

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return new JsonResponse(['error' => 'Invalid JSON'], 400);
        }

        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!is_string($username) || !is_string($password)) {
            return new JsonResponse(['error' => 'Invalid data types'], 400);
        }

        return new JsonResponse(
            $this->service->register($username, $password)
        );
    }

    #[Route('/password', name: 'password', methods: ['GET'])]
    public function getPassword(Request $request): JsonResponse
    {
        $username = $request->query->get('username');

        if (!is_string($username) || $username === '') {
            return new JsonResponse(['error' => 'Missing username'], 400);
        }

        $password = $this->service->getPassword($username);

        if ($password === null) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse([
            'username' => $username,
            'password' => $password
        ]);
    }
}
