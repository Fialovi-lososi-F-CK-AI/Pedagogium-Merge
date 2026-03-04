<?php
namespace App\Repository;

use App\Entity\User;
use App\Service\DatabaseService;

class UserRepository
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    public function findByUsername(string $username): ?User
    {
        $stmt = $this->db->getPDO()->prepare("SELECT * FROM users WHERE username=:u");
        $stmt->execute(['u' => $username]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return null;

        $user = new User($row['username'], $row['password']);
        $userReflection = new \ReflectionProperty(User::class, 'id');
        $userReflection->setAccessible(true);
        $userReflection->setValue($user, (int)$row['id']);

        return $user;
    }

    public function save(User $user): bool
    {
        if ($user->getId()) {
            $stmt = $this->db->getPDO()->prepare("UPDATE users SET password=:p WHERE id=:id");
            return $stmt->execute(['p' => $user->getPassword(), 'id' => $user->getId()]);
        } else {
            $stmt = $this->db->getPDO()->prepare("INSERT INTO users (username, password) VALUES (:u,:p)");
            $result = $stmt->execute(['u' => $user->getUsername(), 'p' => $user->getPassword()]);
            $userReflection = new \ReflectionProperty(User::class, 'id');
            $userReflection->setAccessible(true);
            $userReflection->setValue($user, (int)$this->db->getPDO()->lastInsertId());
            return $result;
        }
    }
}
