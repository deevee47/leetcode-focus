import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/problems/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface TimerProps {
  initialDuration: number;
}

// Global state to track if test is active
let isTestActive = false;

// Function to show fullscreen warning
const showFullscreenWarning = () => {
  const existingWarning = document.querySelector('.fullscreen-warning');
  if (!existingWarning) {
    const warning = document.createElement('div');
    warning.className = 'fullscreen-warning';
    warning.textContent = "Don't get distracted, Try to brainstorm and solve!";
    document.body.appendChild(warning);


    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 1000);
  }
};



const handleVisibilityChange = () => {
  if (document.hidden && isTestActive) {
    alert("Warning: Please don't switch tabs during the test!");
    window.focus();
    handleFullscreen();
  }
};

const Timer = ({ initialDuration }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) {
      if (timeLeft === 0) {
        setIsTimerRunning(false)
        isTestActive = false; // Disable restrictions when timer ends
        alert("Time's up!")
      }
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="leetcode-timer">
      {formatTime(timeLeft)}
    </div>
  )
}

// Function to set up and inject the timer
const setupTimer = (duration: number) => {
  let timerContainer = document.getElementById("leetcode-timer-container")
  if (timerContainer) {
    return
  }

  const targetDiv = document.querySelector(
    ".flex.w-full.items-center.justify-between"
  )

  if (!targetDiv) {
    console.warn("Target div for timer not found")
    return false
  }

  timerContainer = document.createElement("div")
  timerContainer.id = "leetcode-timer-container"
  timerContainer.style.cssText = `
    margin-left: auto;
    padding: 0 16px;
    display: flex;
    align-items: center;
  `

  const styleElement = document.createElement("style")
  styleElement.textContent = `
    .leetcode-timer {
      background-color: #1A1A1A;
      color: #FFA116;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .fullscreen-warning {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #FF4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      animation: fadeInOut 3s ease-in-out;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { opacity: 0; }
    }
  `
  document.head.appendChild(styleElement)

  while (targetDiv.firstChild) {
    targetDiv.removeChild(targetDiv.firstChild)
  }
  const reactRoot = document.createElement("div")
  timerContainer.appendChild(reactRoot)
  targetDiv.appendChild(timerContainer)

  const root = createRoot(reactRoot)
  root.render(<Timer initialDuration={duration} />)

  return true
}
const handleFullscreen = () => {
  if (!document.fullscreenElement && isTestActive) {
    // Force back to fullscreen
    document.documentElement.requestFullscreen().catch(err => {
      console.error("Failed to enter fullscreen:", err);
      
      // alert("Don't get distracted, try to brainstorm the question!");
      return;
    });
    showFullscreenWarning();
  }
};

// Prevent programmatic fullscreen exits
document.addEventListener('keydown', (e) => {
  if (isTestActive) {
    const fullscreenKeys = ['F11', 'Escape'];
    if (fullscreenKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
}, true);

// Monitor fullscreen state continuously
setInterval(() => {
  if (isTestActive && !document.fullscreenElement) {
    handleFullscreen();
  }
}, 1000);


const setupSecurityMeasures = () => {
  document.addEventListener('fullscreenchange', handleFullscreen);


  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Prevent context menu (right click)
  document.addEventListener('contextmenu', (e) => {
    if (isTestActive) {
      e.preventDefault();
      return false;
    }
  });

  // Block keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (isTestActive) {

      const blockedKeys = [
        'F11',          
        'Escape',       
        'Tab',          
        'F4',           
        'w', 'W'        
      ];

      if (
        blockedKeys.includes(e.key) ||
        (e.ctrlKey && (e.key === 'w' || e.key === 'W')) ||
        e.keyCode === 27 // Escape key
      ) {
        e.preventDefault();
        return false;
      }
    }
  }, true);

  // Prevent browser shortcuts
  window.addEventListener('beforeunload', (e) => {
    if (isTestActive) {
      e.preventDefault();
      return '';
    }
  });
}

const setupMessageHandler = () => {
  const removeSolutions = (states) => {
    const solutionParentDiv = document.querySelectorAll(".flexlayout__tab_button.flexlayout__tab_button_top.flexlayout__tab_button--unselected");
    const editorialDiv = solutionParentDiv[0];
    const solutionsDiv = solutionParentDiv[1];
    const submissionsDiv = solutionParentDiv[2];

    if (states.editorial === true) {
      editorialDiv.remove();
    }
    if (states.solutions === true) {
      solutionsDiv.remove();
    }
    if (states.submissions === true) {
      submissionsDiv.remove();
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_TIMER") {
      console.log("Received START_TIMER with duration:", message.duration)

      const injected = setupTimer(message.duration)

      if (injected) {
        isTestActive = true; // Enable restrictions
        handleFullscreen(); 
        setupSecurityMeasures(); 
        removeSolutions(message.states);
        sendResponse({ status: "Timer started successfully" });
      } else {
        sendResponse({ status: "Failed to inject timer" });
      }
    }
    return true;
  });
}

setupMessageHandler();

export default setupMessageHandler;