<?php
namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    private UserService $service;

    public function __construct(UserService $service)
    {
        $this->service = $service;
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['username'],$data['password'])) {
            return new JsonResponse(['error'=>'Missing data'],400);
        }

        return new JsonResponse($this->service->register($data['username'],$data['password']));
    }

    #[Route('/password', name: 'password', methods: ['GET'])]
    public function getPassword(Request $request): JsonResponse
    {
        $username = $request->query->get('username');
        if (!$username) return new JsonResponse(['error'=>'Missing username'],400);

        $password = $this->service->getPassword($username);
        if (!$password) return new JsonResponse(['error'=>'User not found'],404);

        return new JsonResponse(['username'=>$username,'password'=>$password]);
    }
}
