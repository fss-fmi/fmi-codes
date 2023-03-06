import { ReactNode } from 'react';
import HeroLogo from '../components/hero-logo/hero-logo';
import Countdown from '../components/countdown/countdown';

/**
 * Defines the home page.
 * @return {ReactNode} Home page component.
 * @constructor
 */
export default function HomePage(): ReactNode {
  return (
    <div className="h-screen">
      <div className="absolute flex top-0 left-0 w-full h-full items-end justify-center">
        <div className="flex flex-col gap-2 z-10 text-red-600 mb-12">
          <span className="w-full text-center">ДО НАЧАЛОТО:</span>
          <Countdown targetDate={'2023/03/17 17:00:00'} />
        </div>
      </div>
      <HeroLogo />
    </div>
  );
}
