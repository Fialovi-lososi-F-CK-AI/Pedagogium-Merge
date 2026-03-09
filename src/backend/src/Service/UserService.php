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

    /** @return array{status:string}|array{error:string} */
    public function register(string $username, string $password): array
    {
        if ($this->repo->findOneBy(['username' => $username])) {
            return ['error' => 'User exists'];
        }

        $encrypted = $this->passwordService->encrypt($password);
        $user = new User($username, $encrypted);

        $this->em->persist($user);
        $this->em->flush();

        return ['status' => 'ok'];
    }

    public function getPassword(string $username): ?string
    {
        $user = $this->repo->findOneBy(['username' => $username]);
        if (!$user) return null;

        return $this->passwordService->decrypt($user->getPassword());
    }

    public function checkUser(string $username, string $password): bool
    {
        $user = $this->repo->findOneBy(['username' => $username]);

        if (!$user) {
            return false;
        }

        return $user->getPassword() === $password;
    }
}
