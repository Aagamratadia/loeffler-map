/*
 * Node.js utility to call Python ML inference subprocess.
 * This file is used by Next.js API routes to make predictions.
 */

import { spawn } from "child_process";
import path from "path";

/**
 * Call Python ML inference subprocess
 * @param inputData Patient feature data
 * @returns Prediction result
 */
export async function callMLInference(inputData: Record<string, number>) {
  return new Promise((resolve, reject) => {
    // Path to Python inference script
    const scriptPath = path.join(process.cwd(), "scripts", "ml_inference.py");
    
    // Spawn Python process
    const pythonProcess = spawn("python3", [scriptPath], {
      timeout: 30000, // 30 second timeout
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    // Collect stdout
    pythonProcess.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    // Collect stderr
    pythonProcess.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    // Send input data to Python process
    pythonProcess.stdin?.write(JSON.stringify(inputData));
    pythonProcess.stdin?.end();

    // Handle process completion
    pythonProcess.on("close", (code) => {
      try {
        // Parse JSON output
        const result = JSON.parse(stdout);

        if (code === 0 && result.success) {
          resolve(result);
        } else {
          reject(
            new Error(
              result.error || `Python process exited with code ${code}`
            )
          );
        }
      } catch (e) {
        reject(
          new Error(
            `Failed to parse ML output: ${stderr || stdout || e}`
          )
        );
      }
    });

    // Handle errors
    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });
  });
}

/**
 * Check if ML model is available
 * @returns true if model files exist
 */
export function isModelAvailable(): boolean {
  const fs = require("fs");
  const modelPath = path.join(
    process.cwd(),
    "scripts",
    "models",
    "antihypertensive_model.pkl"
  );
  return fs.existsSync(modelPath);
}
