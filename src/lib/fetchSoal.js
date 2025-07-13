export async function fetchSoal(prompt) {
  const response = await fetch("https://ogaa12-api-inference-endpoint.hf.space/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Gagal dari Gemini API: " + data.detail);
  }

  return data.generated_text;
}
