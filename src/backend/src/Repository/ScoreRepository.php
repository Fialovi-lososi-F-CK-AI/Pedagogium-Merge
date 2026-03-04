<?php
namespace App\Repository;

use App\Entity\Score;
use App\Entity\User;
use App\Service\DatabaseService;

class ScoreRepository
{
    private DatabaseService $db;

    public function __construct(DatabaseService $db)
    {
        $this->db = $db;
    }

    /** @return Score[] */
    public function getTop5(): array
    {
        $stmt = $this->db->getPDO()->query("
            SELECT s.id, s.user_id, s.score, u.username, u.password
            FROM scores s
            JOIN users u ON u.id = s.user_id
            ORDER BY s.score DESC
            LIMIT 5
        ");

        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        $scores = [];
        foreach ($rows as $row) {
            $user = new User($row['username'], $row['password']);
            $userId = (int)$row['user_id'];
            $userReflection = new \ReflectionProperty(User::class, 'id');
            $userReflection->setAccessible(true);
            $userReflection->setValue($user, $userId);

            $score = new Score($user, (int)$row['score']);
            $scoreId = (int)$row['id'];
            $scoreReflection = new \ReflectionProperty(Score::class, 'id');
            $scoreReflection->setAccessible(true);
            $scoreReflection->setValue($score, $scoreId);

            $scores[] = $score;
        }

        return $scores;
    }

    public function findByUserId(int $userId): ?Score
    {
        $stmt = $this->db->getPDO()->prepare("SELECT * FROM scores WHERE user_id=:u");
        $stmt->execute(['u' => $userId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return null;

        // musíme mít uživatele – tady prostě fake user kvůli entity
        $user = new User('', '');
        $userReflection = new \ReflectionProperty(User::class, 'id');
        $userReflection->setAccessible(true);
        $userReflection->setValue($user, (int)$row['user_id']);

        $score = new Score($user, (int)$row['score']);
        $scoreReflection = new \ReflectionProperty(Score::class, 'id');
        $scoreReflection->setAccessible(true);
        $scoreReflection->setValue($score, (int)$row['id']);

        return $score;
    }

    public function save(Score $score): bool
    {
        if ($score->getId()) {
            $stmt = $this->db->getPDO()->prepare("UPDATE scores SET score=:s WHERE id=:id");
            return $stmt->execute(['s' => $score->getValue(), 'id' => $score->getId()]);
        } else {
            $stmt = $this->db->getPDO()->prepare("INSERT INTO scores (user_id, score) VALUES (:u,:s)");
            $result = $stmt->execute(['u' => $score->getUser()->getId(), 's' => $score->getValue()]);
            $scoreReflection = new \ReflectionProperty(Score::class, 'id');
            $scoreReflection->setAccessible(true);
            $scoreReflection->setValue($score, (int)$this->db->getPDO()->lastInsertId());
            return $result;
        }
    }
}
