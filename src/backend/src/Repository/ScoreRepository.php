<?php
namespace App\Repository;

use App\Entity\Score;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Score>
 */
class ScoreRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Score::class);
    }

    /**
     * @return Score[]
     */
    public function getTop5(): array
    {
        return $this->createQueryBuilder('s')
            ->join('s.user', 'u')
            ->addSelect('u')
            ->orderBy('s.value', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();
    }

    /**
     * @param User $user
     * @return Score|null
     */
    public function findByUser(User $user): ?Score
    {
        return $this->findOneBy(['user' => $user]);
    }

    /**
     * @param int $userId
     * @return Score|null
     */
    public function findByUserId(int $userId): ?Score
    {
        return $this->createQueryBuilder('s')
            ->join('s.user', 'u')
            ->where('u.id = :uid')
            ->setParameter('uid', $userId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
