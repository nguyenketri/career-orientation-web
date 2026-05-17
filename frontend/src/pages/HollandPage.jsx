import { useState } from "react";
import hollandTypes from "../utils/hollandTypes";
import hollandQuestions from "../data/hollandQuestions";
import { recommendByHolland } from "../services/hollandService";

const HollandPage = () => {
  // answers state
  const [answers, setAnswers] = useState({});

  // result state
  const [result, setResult] = useState(null);

  // submit state
  const [submitted, setSubmitted] = useState(false);
  const [recommendedMajors, setRecommendedMajors] = useState([]);
  // error state
  const [error, setError] = useState("");
  const totalQuestions = hollandQuestions.length;

  const answeredQuestions = Object.keys(answers).length;

  const progress = (answeredQuestions / totalQuestions) * 100;
  // handle select answer
  const handleSelect = (questionId, value) => {
    // prevent changing answers after submit
    if (submitted) return;

    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  // submit holland test
  const handleSubmit = async () => {
    setError("");

    // validate all questions answered
    if (Object.keys(answers).length !== hollandQuestions.length) {
      return setError("Please answer all questions before submitting.");
    }

    // reset old result
    setResult(null);

    // holland score object
    const hollandScores = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    };

    // calculate scores
    hollandQuestions.forEach((question) => {
      const answer = answers[question.id];

      if (answer === "yes") {
        hollandScores[question.type]++;
      }
    });

    // sort highest score
    const sorted = Object.entries(hollandScores).sort((a, b) => b[1] - a[1]);

    // top result
    setResult(sorted[0][0]);
    const topType = sorted[0][0];

    setResult(topType);

    // call API
    const response = await recommendByHolland(topType);

    setRecommendedMajors(response.data);
    // lock test
    setSubmitted(true);
  };

  // retake test
  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20 text-white">
      {/* Hero */}
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-purple-400">
          Holland Career Test
        </p>

        <h1 className="mb-6 text-5xl font-bold">
          Discover Your Personality Type
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          Answer several questions and discover which career path best matches
          your personality.
        </p>
      </div>

      {/* Progress */}
      <div className="mx-auto mt-12 max-w-4xl">
        <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
          <span>Progress</span>

          <span>
            {answeredQuestions}/{totalQuestions}
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            style={{
              width: `${progress}%`,
            }}
            className="h-full rounded-full bg-purple-500 transition-all duration-300"
          ></div>
        </div>
      </div>

      {/* Questions */}
      <div className="mx-auto mt-16 max-w-4xl space-y-6">
        {hollandQuestions.map((question) => (
          <div
            key={question.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            {/* Question */}
            <div className="mb-6">
              <p className="mb-2 text-sm text-purple-400">
                Question {question.id}
              </p>

              <h2 className="text-xl font-semibold">{question.question}</h2>
            </div>

            {/* Answers */}
            <div className="flex gap-4">
              {/* YES */}
              <button
                disabled={submitted}
                onClick={() => handleSelect(question.id, "yes")}
                className={`rounded-2xl px-6 py-3 transition ${
                  answers[question.id] === "yes"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-gray-300"
                } ${
                  submitted
                    ? "cursor-not-allowed opacity-60"
                    : "hover:scale-105"
                }`}
              >
                Yes
              </button>

              {/* NO */}
              <button
                disabled={submitted}
                onClick={() => handleSelect(question.id, "no")}
                className={`rounded-2xl px-6 py-3 transition ${
                  answers[question.id] === "no"
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-gray-300"
                } ${
                  submitted
                    ? "cursor-not-allowed opacity-60"
                    : "hover:scale-105"
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={`w-full rounded-3xl py-4 font-semibold transition ${
            submitted
              ? "cursor-not-allowed bg-gray-600 text-gray-300"
              : "bg-white text-black hover:scale-[1.01]"
          }`}
        >
          {submitted ? "Test Submitted" : "Submit Test"}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-3xl border border-purple-500/20 bg-purple-500/10 p-8 text-center">
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-purple-300">
              Your Holland Type
            </p>

            <h2 className="text-5xl font-bold">
              {hollandTypes[result]} ({result})
            </h2>

            <p className="mt-4 text-gray-300">
              This personality type matches your interests and strengths.
            </p>

            {/* Retake */}
            <button
              onClick={handleRetake}
              className="mt-8 rounded-2xl border border-white/10 px-6 py-3 text-white transition hover:bg-white hover:text-black"
            >
              Retake Test
            </button>
          </div>
        )}

        {recommendedMajors.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-6 text-3xl font-bold">Recommended Majors</h3>

            <div className="grid gap-6 md:grid-cols-2">
              {recommendedMajors.map((major) => (
                <div
                  key={major._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-2xl font-bold">{major.name}</h4>

                    <span className="rounded-full bg-purple-500/20 px-4 py-1 text-sm text-purple-300">
                      {major.benchmarkScore}
                    </span>
                  </div>

                  <p className="text-gray-400">{major.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HollandPage;
