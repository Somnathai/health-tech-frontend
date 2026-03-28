import { useState } from 'react';

const QUIZ_DATA = [
  {
    question: "How would you describe your daily energy levels and sleep?",
    options: ["Hard to fall asleep", "Waking up tired", "Mid-day crashes", "Insomnia", "Snoring", "None of the above"]
  },
  {
    question: "Are you experiencing any digestive or gut issues?",
    options: ["Bloating after meals", "Acid reflux / Heartburn", "Constipation", "Diarrhea", "Frequent Nausea", "None of the above"]
  },
  {
    question: "Are you currently experiencing any physical pain or discomfort?",
    options: ["Frequent Headaches", "Joint Pain", "Muscle Aches", "Lower Back Pain", "Chest Tightness", "None of the above"]
  },
  {
    question: "Have you noticed any unexplained changes in weight or metabolism?",
    options: ["Unexplained Weight Gain", "Unexplained Weight Loss", "Constant Hunger", "Severe Sugar Cravings", "Difficulty Losing Weight", "None of the above"]
  },
  {
    question: "Have you noticed any changes in your skin, hair, or nails?",
    options: ["Hair thinning or loss", "Unusually dry skin", "Frequent acne breakouts", "Brittle nails", "Unexplained rashes", "None of the above"]
  },
  {
    question: "How would you describe your current mood and cognitive focus?",
    options: ["Frequent Brain Fog", "Feeling Anxious", "Feeling Depressed", "Severe Mood Swings", "Difficulty Concentrating", "None of the above"]
  },
  {
    question: "Which of these apply to your current lifestyle?",
    options: ["High daily stress", "Exercise less than 2x a week", "Sedentary desk job", "Smoke or Vape", "Drink alcohol regularly", "None of the above"]
  }
];

function App() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [answers, setAnswers] = useState(Array(QUIZ_DATA.length).fill([]));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const toggleOption = (questionIndex, optionStr) => {
    const currentSelections = [...answers[questionIndex]];
    if (optionStr === "None of the above") {
      setAnswers(prev => {
        const newAns = [...prev];
        newAns[questionIndex] = currentSelections.includes(optionStr) ? [] : [optionStr];
        return newAns;
      });
      return;
    }
    let updatedSelections = currentSelections.filter(item => item !== "None of the above");
    if (updatedSelections.includes(optionStr)) {
      updatedSelections = updatedSelections.filter(item => item !== optionStr);
    } else {
      updatedSelections.push(optionStr);
    }
    setAnswers(prev => {
      const newAns = [...prev];
      newAns[questionIndex] = updatedSelections;
      return newAns;
    });
  };

  const handleNext = () => {
    if (currentStep === 0 && (!email || !age)) return;
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const resetForm = () => {
    setCurrentStep(0);
    setAnswers(Array(QUIZ_DATA.length).fill([]));
    setMessage(null);
    setEmail('');
    setAge('');
    setSubmittedEmail('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    setSubmittedEmail(email);
    setCurrentStep(QUIZ_DATA.length + 1); // Go to final screen immediately

    let compiledSymptoms = "";
    QUIZ_DATA.forEach((q, index) => {
      const selectedOptions = answers[index];
      if (selectedOptions.length > 0) {
        compiledSymptoms += `${q.question} User Selected: ${selectedOptions.join(", ")}.\n`;
      }
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/diagnostics/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          age: parseInt(age),
          reportedSymptoms: compiledSymptoms
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success' });
      } else {
        setMessage({ type: 'error', text: 'Something went wrong on the server. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cannot connect to the server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = currentStep === 0 ? 0 : ((currentStep) / QUIZ_DATA.length) * 100;

  return (
      <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Inter', sans-serif" }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: '50px', padding: '8px 20px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px' }}>🏥</span>
            <span style={{ color: '#7c8cf8', fontWeight: '700', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>FLS Health</span>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '800', margin: '0 0 8px' }}>AI Clinical Diagnostic Engine</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Powered by advanced symptom analysis • Results sent to your inbox</p>
        </div>

        {/* Card */}
        <div style={{ background: '#1a1d2e', borderRadius: '24px', border: '1px solid #2a2d3e', width: '100%', maxWidth: '640px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Progress Bar */}
          {currentStep > 0 && currentStep <= QUIZ_DATA.length && (
              <div style={{ background: '#0f1117', height: '4px', width: '100%' }}>
                <div style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', height: '4px', width: `${progressPercentage}%`, transition: 'width 0.5s ease' }} />
              </div>
          )}

          <div style={{ padding: '40px' }}>

            {/* STEP 0: Intake */}
            {currentStep === 0 && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🩺</div>
                    <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '800', margin: '0 0 8px' }}>Clinical Intake Form</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Let's get a comprehensive picture of your health.</p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Email Address
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        style={{ width: '100%', padding: '14px 16px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#2a2d3e'}
                    />
                    <p style={{ color: '#4b5563', fontSize: '12px', marginTop: '6px' }}>📧 Your PDF report will be sent here</p>
                  </div>

                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Your Age
                    </label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 28"
                        style={{ width: '100%', padding: '14px 16px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '12px', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#6366f1'}
                        onBlur={e => e.target.style.borderColor = '#2a2d3e'}
                    />
                  </div>

                  <button
                      onClick={handleNext}
                      disabled={!email || !age}
                      style={{ width: '100%', padding: '16px', background: (!email || !age) ? '#1f2937' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: (!email || !age) ? '#4b5563' : '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: (!email || !age) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                  >
                    Start Health Assessment →
                  </button>

                  {/* Trust badges */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
                    {['🔒 Private & Secure', '🤖 AI Powered', '📄 PDF Report'].map((badge, i) => (
                        <span key={i} style={{ color: '#4b5563', fontSize: '12px' }}>{badge}</span>
                    ))}
                  </div>
                </div>
            )}

            {/* STEPS 1-N: Questions */}
            {currentStep > 0 && currentStep <= QUIZ_DATA.length && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ color: '#6366f1', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Question {currentStep} of {QUIZ_DATA.length}
                </span>
                    <span style={{ color: '#4b5563', fontSize: '13px' }}>
                  {Math.round(progressPercentage)}% complete
                </span>
                  </div>

                  <h2 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>
                    {QUIZ_DATA[currentStep - 1].question}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>Select all that apply</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
                    {QUIZ_DATA[currentStep - 1].options.map((option, idx) => {
                      const isSelected = answers[currentStep - 1].includes(option);
                      return (
                          <button
                              key={idx}
                              onClick={() => toggleOption(currentStep - 1, option)}
                              style={{
                                padding: '14px 16px',
                                textAlign: 'left',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6366f1' : '2px solid #2a2d3e',
                                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#0f1117',
                                color: isSelected ? '#a5b4fc' : '#9ca3af',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                          >
                            <span style={{ marginRight: '8px' }}>{isSelected ? '✓' : '○'}</span>
                            {option}
                          </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2d3e', paddingTop: '24px' }}>
                    <button
                        onClick={handleBack}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2a2d3e', borderRadius: '10px', color: '#9ca3af', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>

                    {currentStep < QUIZ_DATA.length ? (
                        <button
                            onClick={handleNext}
                            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Generate My Report 🚀
                        </button>
                    )}
                  </div>
                </div>
            )}

            {/* FINAL STEP */}
            {currentStep > QUIZ_DATA.length && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>

                  {/* Pending / Sending state */}
                  {loading && (
                      <div>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚙️</div>
                        <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Submitting your assessment...</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>Hang on a moment</p>
                      </div>
                  )}

                  {/* Success state */}
                  {!loading && message?.type === 'success' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '56px' }}>✅</div>
                        <div>
                          <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', margin: '0 0 8px' }}>Assessment Submitted!</h2>
                          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Your report is being generated by our AI engine.</p>
                        </div>

                        {/* Main info card */}
                        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                          <p style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '14px', margin: '0 0 8px' }}>📧 Report sending to:</p>
                          <p style={{ color: '#ffffff', fontWeight: '700', fontSize: '17px', margin: '0 0 12px' }}>{submittedEmail}</p>
                          <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                            Your clinical report will arrive in your inbox within <strong style={{ color: '#a5b4fc' }}>2–3 minutes</strong>.
                            Our server is analyzing your symptoms and generating a personalized PDF report.
                          </p>
                        </div>

                        {/* Close tab notice */}
                        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
                          <p style={{ color: '#6ee7b7', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                            ✅ <strong>You can safely close this tab!</strong> Your request has already been sent to our servers. The report will be emailed to you automatically — no need to wait here.
                          </p>
                        </div>

                        {/* Spam notice */}
                        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '14px' }}>
                          <p style={{ color: '#fcd34d', fontSize: '13px', margin: 0 }}>
                            📬 Don't see it after 3 minutes? Check your <strong>spam / junk folder</strong>.
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                              onClick={resetForm}
                              style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            🔄 Start New Assessment
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Error state */}
                  {!loading && message?.type === 'error' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: '56px' }}>⚠️</div>
                        <div>
                          <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '800', margin: '0 0 8px' }}>Something went wrong</h2>
                          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{message.text}</p>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px' }}>
                          <p style={{ color: '#fca5a5', fontSize: '13px', margin: 0 }}>
                            This may be because our server is waking up. Please wait 30 seconds and try again.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                              onClick={() => { setCurrentStep(QUIZ_DATA.length); setMessage(null); }}
                              style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#ffffff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Try Again
                          </button>
                          <button
                              onClick={resetForm}
                              style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #2a2d3e', borderRadius: '12px', color: '#9ca3af', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Start Over
                          </button>
                        </div>
                      </div>
                  )}

                </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#374151', fontSize: '12px' }}>© 2026 FLS Health • AI-powered clinical diagnostics • Not a substitute for medical advice</p>
        </div>

      </div>
  );
}

export default App;