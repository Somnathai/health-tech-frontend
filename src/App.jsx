import { useState } from 'react';

// A comprehensive, multi-select diagnostic question set
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
  // Step 0 = Intro/Email, Step 1-7 = Questions, Step 8 = Submitting
  const [currentStep, setCurrentStep] = useState(0);

  // User Data
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');

  // Answers array initialized with empty arrays for each question
  const [answers, setAnswers] = useState(Array(QUIZ_DATA.length).fill([]));

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Smart toggle logic for multiple choice options
  const toggleOption = (questionIndex, optionStr) => {
    const currentSelections = [...answers[questionIndex]];

    // If they click "None of the above", clear everything else and just set "None"
    if (optionStr === "None of the above") {
      setAnswers(prev => {
        const newAns = [...prev];
        newAns[questionIndex] = currentSelections.includes(optionStr) ? [] : [optionStr];
        return newAns;
      });
      return;
    }

    // If they click a normal option, make sure "None" is removed
    let updatedSelections = currentSelections.filter(item => item !== "None of the above");

    if (updatedSelections.includes(optionStr)) {
      // Remove it if it was already selected
      updatedSelections = updatedSelections.filter(item => item !== optionStr);
    } else {
      // Add it to the selections
      updatedSelections.push(optionStr);
    }

    setAnswers(prev => {
      const newAns = [...prev];
      newAns[questionIndex] = updatedSelections;
      return newAns;
    });
  };

  const handleNext = () => {
    if (currentStep === 0 && (!email || !age)) return; // Prevent moving forward without basics
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    // Compile the arrays into a neat text summary for the AI Brain
    let compiledSymptoms = "";
    QUIZ_DATA.forEach((q, index) => {
      const selectedOptions = answers[index];
      if (selectedOptions.length > 0) {
        compiledSymptoms += `${q.question} User Selected: ${selectedOptions.join(", ")}.\n`;
      }
    });

    try {
      const response = await fetch('http://localhost:8080/api/diagnostics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          age: parseInt(age),
          reportedSymptoms: compiledSymptoms
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Success! Your branded clinical report has been generated and emailed to you.' });
        setCurrentStep(QUIZ_DATA.length + 1); // Move to a "Done" screen
      } else {
        setMessage({ type: 'error', text: 'Something went wrong on the server.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cannot connect to the backend server.' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress bar percentage
  const progressPercentage = currentStep === 0 ? 0 : ((currentStep) / QUIZ_DATA.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

        {/* Progress Bar Header */}
        {currentStep > 0 && currentStep <= QUIZ_DATA.length && (
          <div className="bg-gray-100 h-2 w-full">
            <div
              className="bg-blue-600 h-2 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}

        <div className="p-8">

          {/* STEP 0: Intake Details */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Clinical Intake Form</h1>
                <p className="text-gray-500 mt-2">Let's get a comprehensive picture of your health.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (To receive your PDF report)</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="patient@example.com" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Age</label>
                <input type="number" required min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 28" />
              </div>

              <button
                onClick={handleNext}
                disabled={!email || !age}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg mt-4 disabled:bg-blue-300 transition"
              >
                Start Assessment
              </button>
            </div>
          )}

          {/* STEPS 1 to N: The Quiz Questions */}
          {currentStep > 0 && currentStep <= QUIZ_DATA.length && (
            <div className="space-y-6">
              <p className="text-sm font-bold text-blue-600 tracking-wider uppercase">Question {currentStep} of {QUIZ_DATA.length}</p>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {QUIZ_DATA[currentStep - 1].question}
              </h2>
              <p className="text-gray-500 text-sm mb-4">Select all that apply.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUIZ_DATA[currentStep - 1].options.map((option, idx) => {
                  const isSelected = answers[currentStep - 1].includes(option);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleOption(currentStep - 1, option)}
                      className={`p-4 text-left rounded-xl border-2 transition duration-200 font-medium ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t mt-8">
                <button onClick={handleBack} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">
                  Back
                </button>

                {currentStep < QUIZ_DATA.length ? (
                  <button onClick={handleNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md">
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md disabled:bg-green-400"
                  >
                    {loading ? 'Analyzing Data...' : 'Submit & Generate PDF'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FINAL STEP: Success/Error Message */}
          {currentStep > QUIZ_DATA.length && (
            <div className="text-center py-10 space-y-4">
              {message?.type === 'success' ? (
                <>
                  <div className="text-green-500 text-6xl mb-4">✓</div>
                  <h2 className="text-2xl font-bold text-gray-800">Assessment Complete</h2>
                  <p className="text-gray-600">{message.text}</p>
                  <button onClick={() => { setCurrentStep(0); setAnswers(Array(QUIZ_DATA.length).fill([])); }} className="mt-8 px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
                    Take Another Assessment
                  </button>
                </>
              ) : (
                <>
                  <div className="text-red-500 text-6xl mb-4">⚠</div>
                  <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
                  <p className="text-gray-600">{message?.text}</p>
                  <button onClick={() => setCurrentStep(QUIZ_DATA.length)} className="mt-8 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Try Submitting Again
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;