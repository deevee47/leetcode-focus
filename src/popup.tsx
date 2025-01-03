import { useState, useEffect } from "react";
import { FaCheck, FaPlus, FaMinus, FaTwitter, FaLinkedin } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import "~style.css";

const IndexPopup = () => {
  const switchLabels = ["Editorial", "Solutions", "Submissions", "Discussion"];
  const [switchStates, setSwitchStates] = useState({
    editorial: true,
    solutions: true,
    submissions: true,
    discussion: true,
  }
  );

  const [selectedTimer, setSelectedTimer] = useState<number>(5); 
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleSwitchChange = (key: string) => {
    setSwitchStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimerChipClick = (minutes: number) => {
    setSelectedTimer(minutes);
  };

  const increaseTimer = () => {
    setSelectedTimer((prev) => Math.min(prev + 1, 60)); // Cap at 60 minutes
  };

  const decreaseTimer = () => {
    setSelectedTimer((prev) => Math.max(prev - 1, 1)); // Minimum 1 minute
  };

  const startTimer = async () => {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        console.error("No active tab found");
        return;
      }

      // Send message to content script
      const message = {
        action: "START_TIMER",
        duration: selectedTimer,
        states: switchStates 
      }
      const response = await chrome.tabs.sendMessage(tab.id, message);
      if (!response) console.error("No Response from the content script")
      setTimeLeft(selectedTimer * 60);
      setIsTimerRunning(true);
      window.close();
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };
  

  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert("Time's up!");
      location.reload();
    }
  }, [isTimerRunning, timeLeft]);

  return (
    <div className="plasmo-dark plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-w-96 plasmo-bg-[#1A1A1A] plasmo-text-[#E6E6E6] plasmo-shadow-lg plasmo-p-6 plasmo-border plasmo-border-[#333333]">
      <h1 className="plasmo-text-2xl plasmo-font-semibold plasmo-mb-4 plasmo-text-[#FFA116]">
        LeetCode Focus
      </h1>

      {/* Timer Section */}
      {!isTimerRunning && (
        <div className="plasmo-text-center plasmo-mb-6">
          <div className="plasmo-text-sm plasmo-text-[#B3B3B3] plasmo-mb-2">
            Set Timer:
          </div>
          <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-space-x-4 plasmo-mb-4">
            <button
              className="plasmo-p-2 plasmo-rounded-full plasmo-bg-[#333333] plasmo-text-[#B3B3B3] hover:plasmo-bg-[#444444] plasmo-transition-all plasmo-duration-200"
              onClick={decreaseTimer}
              disabled={isTimerRunning}
            >
              <FaMinus size={14} />
            </button>
            <div className="plasmo-text-xl plasmo-font-semibold plasmo-text-[#FFA116]">
              {selectedTimer} mins
            </div>
            <button
              className="plasmo-p-2 plasmo-rounded-full plasmo-bg-[#333333] plasmo-text-[#B3B3B3] hover:plasmo-bg-[#444444] plasmo-transition-all plasmo-duration-200"
              onClick={increaseTimer}
              disabled={isTimerRunning}
            >
              <FaPlus size={14} />
            </button>
          </div>
          <div className="plasmo-flex plasmo-space-x-2">
            {[5, 10, 30].map((minutes) => (
              <div
                key={minutes}
                className={`plasmo-px-4 plasmo-py-2 plasmo-rounded-full plasmo-text-sm plasmo-cursor-pointer plasmo-transition-all plasmo-duration-200 ${selectedTimer === minutes
                    ? "plasmo-bg-[#FFA116] plasmo-text-[#1A1A1A]"
                    : "plasmo-bg-[#333333] plasmo-text-[#B3B3B3] hover:plasmo-bg-[#444444]"
                  }`}
                onClick={() => handleTimerChipClick(minutes)}
              >
                {minutes} mins
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Switch Section */}
      <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-4 plasmo-w-full plasmo-mb-6">
        {switchLabels.map((label) => (
          <Switch
            key={label.toLowerCase()}
            label={label}
            checked={switchStates[label.toLowerCase()]}
            onChange={() => handleSwitchChange(label.toLowerCase())}
          />
        ))}
      </div>

      {/* Start Timer Button */}
      <button
        className={`plasmo-w-full plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-text-sm plasmo-font-semibold plasmo-transition-all plasmo-duration-200 ${!isTimerRunning
            ? "plasmo-bg-[#FFA116] plasmo-text-[#1A1A1A] hover:plasmo-bg-[#E59400]"
            : "plasmo-bg-[#333333] plasmo-text-[#B3B3B3] plasmo-cursor-not-allowed"
          }`}
        onClick={startTimer}
        disabled={isTimerRunning}
      >
        {isTimerRunning ? "Timer Running..." : "Start Timer"}
      </button>

      <div className="plasmo-flex plasmo-items-center plasmo-space-x-4 plasmo-mt-4">
        <span className="plasmo-text-sm plasmo-text-[#B3B3B3]">Support:</span>
        <a
          href="https://twitter.com/deevee47"
          target="_blank"
          rel="noopener noreferrer"
          className="plasmo-text-[#B3B3B3] hover:plasmo-text-[#FFA116] plasmo-transition-all plasmo-duration-200"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://linkedin.com/in/deevee47"
          target="_blank"
          rel="noopener noreferrer"
          className="plasmo-text-[#B3B3B3] hover:plasmo-text-[#FFA116] plasmo-transition-all plasmo-duration-200"
        >
          <FaLinkedin size={20} />
        </a>
      </div>
    </div>
  );
};

const Switch = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div className="plasmo-flex plasmo-items-center plasmo-space-x-3 plasmo-w-full">
    <span className="plasmo-text-sm plasmo-text-[#B3B3B3]">{label}</span>
    <label className="plasmo-cursor-pointer plasmo-flex plasmo-items-center">
      <input
        type="checkbox"
        className="plasmo-hidden"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`plasmo-w-14 plasmo-h-8 plasmo-p-1 plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-transition-all plasmo-duration-300 ${checked ? "plasmo-bg-[#FFA116]" : "plasmo-bg-[#333333]"
          }`}
      >
        <div
          className={`plasmo-w-6 plasmo-h-6 plasmo-shadow-sm plasmo-rounded-full plasmo-transition-all plasmo-duration-300 plasmo-flex plasmo-items-center plasmo-justify-center ${checked ? "plasmo-bg-[#1A1A1A] plasmo-translate-x-6" : "plasmo-bg-[#666666]"
            }`}
        >
          {checked ? <FaCheck size={14} className="plasmo-text-[#FFA116]" /> : <RxCross2 size={14} className="plasmo-text-[#B3B3B3]" />}
        </div>
      </div>
    </label>
  </div>
);

export default IndexPopup;