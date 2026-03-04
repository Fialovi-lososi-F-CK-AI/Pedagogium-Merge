<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Artprima\PrometheusMetricsBundle\ArtprimaPrometheusMetricsBundle;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function registerBundles(): iterable
    {
        /**
         * @var array<class-string<\Symfony\Component\HttpKernel\Bundle\BundleInterface>, array<string, bool>> $contents
         */
        $contents = require $this->getProjectDir().'/config/bundles.php';

        foreach ($contents as $class => $envs) {
            if (($envs[$this->environment] ?? $envs['all'] ?? false)) {
                yield new $class();
            }
        }
    }

    protected function configureContainer(ContainerConfigurator $container): void
    {
        $container->import('../config/{packages}/*.yaml');
        $container->import('../config/services.yaml');
    }

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->import('../config/routes/*.yaml');

        $routes->import('@ArtprimaPrometheusMetricsBundle/Resources/config/routing.yaml');
    }
}
