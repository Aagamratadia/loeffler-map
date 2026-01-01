type PredictionPayload = {
  tool: string;
  inputs?: Record<string, unknown>;
  result: unknown;
  metadata?: Record<string, unknown>;
};

export const logPrediction = async (payload: PredictionPayload) => {
  try {
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Failed to log prediction", await response.text());
    }
  } catch (error) {
    console.error("Error logging prediction", error);
  }
};
