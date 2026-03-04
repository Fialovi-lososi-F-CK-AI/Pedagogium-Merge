<?php
namespace App\Service;

use App\Entity\Score;
use App\Repository\ScoreRepository;
use App\Repository\UserRepository;

class ScoreService
{
    private ScoreRepository $scoreRepo;
    private UserRepository $userRepo;

    public function __construct(ScoreRepository $scoreRepo, UserRepository $userRepo)
    {
        $this->scoreRepo = $scoreRepo;
        $this->userRepo = $userRepo;
    }

    /**
     * @param string $username
     * @param int $score
     * @return array<string,string>
     */
    public function saveHighscore(string $username, int $score): array
    {
        $user = $this->userRepo->findByUsername($username);
        if (!$user) return ['error'=>'User not found'];

        $existingScore = $this->scoreRepo->findByUserId($user->getId());
        if ($existingScore) {
            if ($score > $existingScore->getValue()) {
                $existingScore->setValue($score);
                $this->scoreRepo->save($existingScore);
            }
        } else {
            $newScore = new Score($user, $score);
            $this->scoreRepo->save($newScore);
        }

        return ['status'=>'saved'];
    }

    /**
     * @return Score[]
     */
    public function getTop5(): array
    {
        return $this->scoreRepo->getTop5();
    }
}
