<?php
namespace App\Service;

use App\Repository\ScoreRepository;
use App\Repository\UserRepository;
use App\Entity\Score;
use App\Entity\User;

class ScoreService
{
    public function __construct(
        private ScoreRepository $scoreRepo,
        private UserRepository $userRepo
    ) {}

    /** @return array{status: string}|array{error: string} */
    public function saveHighscore(string $username, int $score): array
    {
        $user = $this->userRepo->findOneBy(['username' => $username]);
        if (!$user) return ['error' => 'User not found'];

        $existingScore = $this->scoreRepo->findOneBy(['user' => $user]);
        if ($existingScore) {
            if ($score > $existingScore->getValue()) {
                $existingScore->setValue($score);
                $this->scoreRepo->_em->flush();
            }
        } else {
            $newScore = new Score($user, $score);
            $this->scoreRepo->_em->persist($newScore);
            $this->scoreRepo->_em->flush();
        }

        return ['status' => 'saved'];
    }

    /** @return Score[] */
    public function getTop5(): array
    {
        return $this->scoreRepo->createQueryBuilder('s')
            ->join('s.user', 'u')
            ->orderBy('s.value', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();
    }
}
