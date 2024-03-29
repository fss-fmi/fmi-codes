'use client';
import { useCountdown } from '../../lib/use-countdown';

export interface CountdownProps {
  targetDate: string;
}

export function Countdown(props: CountdownProps) {
  const timeValues = useCountdown(props.targetDate);

  return (
    <div className="flex flex-row justify-center items-center ">
      {timeValues.map((value, index) => (
        <p
          key={index}
          className="acrylic text-xl sm:text-2xl text-center font-black capitalize p-1 m-1 border border-red-600 rounded"
        >
          {value.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}
        </p>
      ))}
    </div>
  );
}

export default Countdown;
