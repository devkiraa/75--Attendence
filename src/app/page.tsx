"use client";

import React, { useState, useEffect } from "react";

export default function AttendancePage() {
  const [requiredPercentage, setRequiredPercentage] = useState<number>(75);
  const [attended, setAttended] = useState<number | "">("");
  const [conducted, setConducted] = useState<number | "">("");
  const [calculated, setCalculated] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [result, setResult] = useState<{
    statusText: string;
    bunkDays: number;
    currentAttnText: string;
    currentAttnPerc: string;
    thenAttnText: string;
    thenAttnPerc: string;
  } | null>(null);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Real-time calculation
  useEffect(() => {
    if (conducted === "" || attended === "") {
      setCalculated(false);
      setResult(null);
      return;
    }

    const c = Number(conducted);
    const a = Number(attended);

    if (c === 0 || a > c) {
      setCalculated(false);
      setResult(null);
      return;
    }

    const currentPerc = (a / c) * 100;
    const reqFraction = requiredPercentage / 100;
    const p = (v: number) => Math.max(0, parseInt(v.toString()));

    if (currentPerc < requiredPercentage) {
      const reqClasses = Math.ceil((reqFraction * c - a) / (1 - reqFraction));
      setResult({
        statusText: `You need to attend`,
        bunkDays: reqClasses,
        currentAttnText: `${p(a)}/${p(c)}`,
        currentAttnPerc: currentPerc.toFixed(2) + "%",
        thenAttnText: `${p(a + reqClasses)}/${p(c + reqClasses)}`,
        thenAttnPerc: (((a + reqClasses) / (c + reqClasses)) * 100).toFixed(2) + "%",
      });
    } else {
      const bunkClasses = Math.floor((a - reqFraction * c) / reqFraction);
      setResult({
        statusText: `You can skip for`,
        bunkDays: bunkClasses,
        currentAttnText: `${p(a)}/${p(c)}`,
        currentAttnPerc: currentPerc.toFixed(2) + "%",
        thenAttnText: `${p(a)}/${p(c + bunkClasses)}`,
        thenAttnPerc:
          bunkClasses === 0
            ? currentPerc.toFixed(2) + "%"
            : ((a / (c + bunkClasses)) * 100).toFixed(2) + "%",
      });
    }

    setCalculated(true);
  }, [conducted, attended, requiredPercentage]);

  const handleShare = async () => {
    if (!result) return;

    const message = result.statusText.includes("skip")
      ? `I'm currently at ${result.currentAttnPerc} attendance, I can skip ${result.bunkDays} classes! 🚀`
      : `I need to attend ${result.bunkDays} more classes to reach my ${requiredPercentage}% goal! 📚`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Attendance Status",
          text: message,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(message);
      alert("Status copied to clipboard!");
    }
  };

  return (
    <main style={styles.container}>
      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        style={styles.themeToggle}
        aria-label="Toggle Dark Mode"
      >
        {theme === "light" ? (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Tracker</h1>
          <p style={styles.subtitle}>
            Find out the number of days you can skip safely or need to attend to
            maintain {requiredPercentage}% attendance.
          </p>
        </div>

        <div style={styles.formContainer}>
          {/* Goal Percentage custom dropdown */}
          <div
            className="dropdown-container"
            style={{ ...styles.inputGroup, overflow: "visible", zIndex: 10, position: "relative" }}
          >
            <div style={styles.inputLabelBox}>Goal Percentage</div>

            <div style={styles.customSelectBox} onClick={() => setDropdownOpen(!dropdownOpen)}>
              {requiredPercentage}%
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                style={{
                  marginLeft: "4px",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {dropdownOpen && (
              <div style={styles.dropdownMenu}>
                {[75, 80, 85, 90].map((val) => (
                  <div
                    key={val}
                    className="dropdown-item"
                    style={{
                      borderBottom: val !== 90 ? "1px solid var(--border-color)" : "none",
                    }}
                    onClick={() => {
                      setRequiredPercentage(val);
                      setDropdownOpen(false);
                    }}
                  >
                    {val}%
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inputs Row */}
          <div style={styles.row}>
            <div style={styles.inputGroupCol}>
              <div style={styles.inputLabelCol}>Classes Attended</div>
              <input
                type="number"
                style={styles.inputBoxCol}
                value={attended}
                placeholder="e.g. 34"
                onChange={(e) =>
                  setAttended(e.target.value === "" ? "" : Number(e.target.value))
                }
                min="0"
              />
            </div>
            <div style={styles.inputGroupCol}>
              <div style={styles.inputLabelCol}>Total Conducted</div>
              <input
                type="number"
                style={styles.inputBoxCol}
                value={conducted}
                placeholder="e.g. 45"
                onChange={(e) =>
                  setConducted(e.target.value === "" ? "" : Number(e.target.value))
                }
                min="0"
              />
            </div>
          </div>

          {/* Result Card */}
          {calculated && result && (
            <div style={styles.resultCard}>
              <div style={styles.resultTitle}>
                {result.statusText}{" "}
                <span style={styles.highlight}>{result.bunkDays}</span>{" "}
                {result.statusText.includes("attend") ? "more classes" : "more days"}
              </div>

              <div style={styles.resultMetrics}>
                <div style={styles.metric}>
                  <p style={styles.metricLabel}>Current</p>
                  <p style={styles.metricValue}>{result.currentAttnText}</p>
                  <p style={styles.metricPerc}>{result.currentAttnPerc}</p>
                </div>
                <div style={styles.metricDivider} />
                <div style={styles.metric}>
                  <p style={styles.metricLabel}>Goal State</p>
                  <p style={styles.metricValue}>{result.thenAttnText}</p>
                  <p style={styles.metricPerc}>{result.thenAttnPerc}</p>
                </div>
              </div>

              <button onClick={handleShare} style={styles.shareButton}>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Status
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    backgroundColor: "var(--bg-color)",
    position: "relative",
  },
  themeToggle: {
    position: "absolute",
    top: "24px",
    right: "24px",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, background-color 0.3s ease",
  },
  content: {
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.5s ease-out forwards",
  },
  header: {
    width: "100%",
    marginBottom: "40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "15px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    maxWidth: "90%",
  },
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  row: {
    display: "flex",
    gap: "16px",
    width: "100%",
  },
  inputGroup: {
    display: "flex",
    width: "100%",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    transition: "border-color 0.2s ease",
  },
  inputGroupCol: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "8px",
    flex: 1,
  },
  inputLabelCol: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    letterSpacing: "0.2px",
  },
  inputBoxCol: {
    width: "100%",
    padding: "16px",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    outline: "none",
    fontSize: "18px",
    fontWeight: 500,
    backgroundColor: "var(--input-bg)",
    color: "var(--text-primary)",
    transition: "border-color 0.2s ease",
  },
  inputLabelBox: {
    padding: "16px 20px",
    backgroundColor: "var(--input-bg)",
    borderRight: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    fontSize: "15px",
    fontWeight: 500,
    flex: "1",
    display: "flex",
    alignItems: "center",
    borderTopLeftRadius: "12px",
    borderBottomLeftRadius: "12px",
  },
  customSelectBox: {
    padding: "16px 20px",
    backgroundColor: "var(--input-bg)",
    color: "var(--text-primary)",
    fontWeight: "700",
    cursor: "pointer",
    width: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopRightRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: "0",
    width: "110px",
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  },
  resultCard: {
    marginTop: "8px",
    padding: "28px 24px",
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    animation: "fadeIn 0.4s ease-out forwards",
  },
  resultTitle: {
    fontSize: "18px",
    color: "var(--text-primary)",
    fontWeight: 500,
    textAlign: "center",
  },
  highlight: {
    fontSize: "22px",
    fontWeight: 800,
  },
  resultMetrics: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
  },
  metric: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  metricLabel: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: "1",
  },
  metricPerc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  metricDivider: {
    width: "1px",
    height: "50px",
    backgroundColor: "var(--border-color)",
  },
  shareButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};
