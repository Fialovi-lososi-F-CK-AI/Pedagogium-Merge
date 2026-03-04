<?php
namespace App\Service;

use App\Repository\UserRepository;
use App\Entity\User;

class UserService
{
    public function __construct(
        private UserRepository $repo,
        private PasswordService $passwordService
    ) {}

    /** @return array{status:string}|array{error:string} */
    public function register(string $username, string $password): array
    {
        if ($this->repo->findOneBy(['username' => $username])) {
            return ['error' => 'User exists'];
        }

        $encrypted = $this->passwordService->encrypt($password);
        $user = new User($username, $encrypted);
        $this->repo->_em->persist($user);
        $this->repo->_em->flush();

        return ['status' => 'ok'];
    }

    public function getPassword(string $username): ?string
    {
        $user = $this->repo->findOneBy(['username' => $username]);
        if (!$user) return null;
        return $this->passwordService->decrypt($user->getPassword());
    }
}
