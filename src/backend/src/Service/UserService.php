<?php
namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;

class UserService
{
    private UserRepository $repo;
    private PasswordService $passwordService;

    public function __construct(UserRepository $repo, PasswordService $passwordService)
    {
        $this->repo = $repo;
        $this->passwordService = $passwordService;
    }

    public function register(string $username, string $password): array
    {
        if ($this->repo->findByUsername($username)) {
            return ['error'=>'User exists'];
        }

        $encrypted = $this->passwordService->encrypt($password);
        $user = new User($username, $encrypted);
        $this->repo->save($user);

        return ['status'=>'ok'];
    }

    public function getPassword(string $username): ?string
    {
        $user = $this->repo->findByUsername($username);
        if (!$user) return null;

        return $this->passwordService->decrypt($user->getPassword());
    }
}
