<?php
namespace App\Repository;

use App\Entity\Score;
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

    /** @return Score[] */
    public function getTop5(): array
    {
        /** @var Score[] $results */
        $results = $this->createQueryBuilder('s')
            ->join('s.user', 'u')
            ->addSelect('u')
            ->orderBy('s.value', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        return $results;
    }

    public function findByUserId(int $userId): ?Score
    {
        /** @var Score|null $score */
        $score = $this->createQueryBuilder('s')
            ->join('s.user', 'u')
            ->where('u.id = :uid')
            ->setParameter('uid', $userId)
            ->getQuery()
            ->getOneOrNullResult();

        return $score;
    }
}
