import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

export const config: PlasmoCSConfig = {
  matches: ["https://leetcode.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Listen for messages from the popup
  useEffect(() => {
    const handleMessage = (
      message: { action: string; duration: number },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.action === "START_TIMER") {
        console.log("Received START_TIMER with duration:", message.duration)
        setTimeLeft(message.duration * 60) // Convert minutes to seconds
        setIsTimerRunning(true)
        enterFullscreen()

        // Send acknowledgment back to popup
        sendResponse({ status: "Timer started" })
      }
    }

    // Make sure to return true to indicate async response
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message, sender, sendResponse)
      return true // Will respond asynchronously
    })

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  // Update timer every second
  useEffect(() => {
    if (!isTimerRunning || timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) {
        setIsTimerRunning(false)
        alert("Time's up!")
      }
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "00:00"
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
    } catch (err) {
      console.error("Failed to enter fullscreen:", err)
    }
  }

  return (
    <div className="leetcode-timer">
      {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
    </div>
  )
}

const injectTimer = () => {

  // Function to inject and setup the timer
  const setupTimer = () => {
    // First, check if we already have a timer container
    let timerContainer = document.getElementById("leetcode-timer-container")

    if (timerContainer) {
      return // Timer already injected
    }

    // Find the target div
    const targetDiv = document.querySelector(
      ".flex.w-full.items-center.justify-between"
    )

    if (!targetDiv) {
      console.warn("Target div for timer not found, retrying in 1 second...")
      setTimeout(setupTimer, 1000)
      return
    }

    // Clear all children of the target div
    while (targetDiv.firstChild) {
      targetDiv.removeChild(targetDiv.firstChild)
    }

    // Create and style the timer container
    timerContainer = document.createElement("div")
    timerContainer.id = "leetcode-timer-container"
    timerContainer.style.cssText = `
      margin-left: auto;
      padding: 0 16px;
      display: flex;
      align-items: center;
    `

    // Add custom styles
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      .leetcode-timer {
        background-color: #1A1A1A;
        color: #FFA116;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: inline-block;
      }
    `
    document.head.appendChild(styleElement)

    // Create a container for React to render into
    const reactRoot = document.createElement("div")
    timerContainer.appendChild(reactRoot)
    targetDiv.appendChild(timerContainer)

    // Create and render the React root
    const root = createRoot(reactRoot)
    root.render(<Timer />)
  }

  // Initial setup attempt
  setupTimer()

  // Watch for navigation changes (for SPA navigation)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const timerExists = document.getElementById("leetcode-timer-container")
      if (!timerExists) {
        setupTimer()
      }
    })
  })

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Cleanup function
  return () => {
    observer.disconnect()
    const timerContainer = document.getElementById("leetcode-timer-container")
    if (timerContainer) {
      timerContainer.remove()
    }
  }
}

export default injectTimer