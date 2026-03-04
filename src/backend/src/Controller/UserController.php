<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/user')]
class UserController extends AbstractController
{
    public function __construct(private UserService $service) {}

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['username'], $data['password'])) {
            return new JsonResponse(['error' => 'Missing data'], 400);
        }

        $username = (string) $data['username'];
        $password = (string) $data['password'];

        return new JsonResponse($this->service->register($username, $password));
    }
}
