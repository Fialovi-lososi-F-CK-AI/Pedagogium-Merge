<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class UserService
{
    public function __construct(
        private UserRepository $repo,
        private PasswordService $passwordService,
        private EntityManagerInterface $em,
    ) {}

    /** @return array{status: string}|array{error: string} */
    public function register(string $username, string $password): array
    {
        if ($this->repo->findOneBy(['username' => $username])) {
            return ['error' => 'User exists'];
        }

        $hashedPassword = $this->passwordService->hash($password);
        $user = new User($username, $hashedPassword);

        $this->em->persist($user);
        $this->em->flush();

        return ['status' => 'ok'];
    }

    public function checkUser(string $username, string $password): bool
    {
        $user = $this->repo->findOneBy(['username' => $username]);

        if (!$user instanceof User) {
            return false;
        }

        return $this->passwordService->verify($password, $user->getPassword());
    }

    public function getValidUser(string $username, string $password): ?User
    {
        $user = $this->repo->findOneBy(['username' => $username]);

        if (!$user instanceof User) {
            return null;
        }

        if (!$this->passwordService->verify($password, $user->getPassword())) {
            return null;
        }

        return $user;
    }

    public function findById(int $id): ?User
    {
        return $this->repo->find($id);
    }
}