<?php

namespace App\Service;

use App\Entity\Score;
use App\Entity\User;
use App\Repository\ScoreRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

class ScoreService
{
    public function __construct(
        private ScoreRepository $scoreRepo,
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
    ) {}

    /** @return array{status: string}|array{error: string} */
    public function saveHighscore(string $username, int $score): array
    {
        $user = $this->userRepo->findOneBy(['username' => $username]);
        if (!$user) {
            return ['error' => 'User not found'];
        }

        return $this->saveHighscoreForUser($user, $score);
    }

    /** @return array{status: string}|array{error: string} */
    public function saveHighscoreForUser(User $user, int $score): array
    {
        $existingScore = $this->scoreRepo->findOneBy(['user' => $user]);

        if ($existingScore) {
            if ($score > $existingScore->getValue()) {
                $existingScore->setValue($score);
                $this->em->flush();
            }
        } else {
            $newScore = new Score($user, $score);
            $this->em->persist($newScore);
            $this->em->flush();
        }

        return ['status' => 'saved'];
    }

    /** @return Score[] */
    public function getTop5(): array
    {
        return $this->scoreRepo->getTop5();
    }
}