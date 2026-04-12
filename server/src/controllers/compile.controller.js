export const compileCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const languageMap = {
      javascript: 63,
      python: 71,
      cpp: 54,
      java: 62,
      c: 50
    };

    const language_id = languageMap[language.toLowerCase()];

    if (!language_id) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": "ce.judge0.com"
        },
        body: JSON.stringify({
          language_id,
          source_code: code
        })
      }
    );

    const data = await response.json();

    res.json({
      output:
        data.stdout ||
        data.stderr ||
        data.compile_output ||
        data.message ||
        "No Output"
    });

  } catch (err) {
    console.error("Compile error:", err);
    res.status(500).json({ message: "Compilation failed" });
  }
};