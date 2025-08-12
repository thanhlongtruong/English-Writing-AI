import { useEffect, useContext, useState, useRef } from "react";
import { TriangleAlert, CircleCheckBig, CloudAlert } from "lucide-react";
import { CONTEXT } from "../context/context";

export function Notification() {
  const { notification, setNotification } = useContext(CONTEXT);
  const DURATION = 3000;

  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const elapsedTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const startTimers = (remainingTime: number) => {
    clearTimers();

    progressIntervalRef.current = setInterval(() => {
      const elapsed =
        Date.now() - startTimeRef.current + elapsedTimeRef.current;
      const newProgress = Math.max(0, ((DURATION - elapsed) / DURATION) * 100);
      setProgress(newProgress);

      if (newProgress <= 0) {
        clearTimers();
        setNotification(null); // Ẩn thông báo
      }
    }, 16);

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      setNotification(null);
    }, remainingTime);
  };

  useEffect(() => {
    if (notification) {
      // Reset thời gian nếu có thông báo mới
      elapsedTimeRef.current = 0;
      startTimeRef.current = Date.now();
      setProgress(100);
      setIsPaused(false);
      startTimers(DURATION);
    }

    return () => clearTimers();
  }, [notification]);

  const handleMouseEnter = () => {
    if (!isPaused) {
      setIsPaused(true);
      elapsedTimeRef.current += Date.now() - startTimeRef.current;
      clearTimers();
    }
  };

  const handleMouseLeave = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      startTimers(DURATION - elapsedTimeRef.current);
    }
  };

  if (!notification) return null;

  const { message, type } = notification;
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-fit p-2 w-64 md:w-80 overflow-hidden fixed top-14 md:top-[4.5rem] right-5 md:right-[50px] z-[999] duration-700 transition-all cursor-pointer flex items-center bg-white shadow-lg border rounded-md ${
        type === "Warn"
          ? "border-yellow-400"
          : type === "Success"
          ? "border-green-400"
          : "border-red-400"
      }`}>
      <div className="flex items-center w-full p-1">
        {type === "Warn" ? (
          <TriangleAlert className="stroke-yellow-400 size-5 md:size-6 flex-shrink-0" />
        ) : type === "Success" ? (
          <CircleCheckBig className="stroke-green-400 size-5 md:size-6 flex-shrink-0" />
        ) : (
          <CloudAlert className="stroke-red-400 size-5 md:size-6 flex-shrink-0" />
        )}
        <p
          className={`ml-3 font-normal text-sm md:text-base font-mono ${
            type === "Warn"
              ? "text-yellow-400"
              : type === "Success"
              ? "text-green-400"
              : "text-red-400"
          }`}>
          {message}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
        <div
          className={`h-full ${
            type === "Warn"
              ? "bg-yellow-400"
              : type === "Success"
              ? "bg-green-400"
              : "bg-red-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
