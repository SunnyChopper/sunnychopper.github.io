const modelDatasetPrompt =
`{
    "model_dataset": [
		{
		  "LLM Model": "GPT-4o (latest)",
		  "Context Window": "128,000",
		  "Quality": 77,
		  "Speed": 105,
		  "Price (lower is better)": "$4.40 ",
		  "Reasoning & Knowledge (MMLU)": "89%",
		  "Scientific Reasoning & Knowledge (GPQA)": "51%",
		  "Quantitative Reasoning (MATH)": "78%",
		  "Coding (HumanEval)": "90%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1316",
		  "Maths (MGSM)": "90%"
		},
		{
		  "LLM Model": "Claude 3.5 Sonnet",
		  "Context Window": "200,000",
		  "Quality": 77,
		  "Speed": 94,
		  "Price (lower is better)": "$6.00 ",
		  "Reasoning & Knowledge (MMLU)": "88%",
		  "Scientific Reasoning & Knowledge (GPQA)": "56%",
		  "Quantitative Reasoning (MATH)": "74%",
		  "Coding (HumanEval)": "90%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1270",
		  "Maths (MGSM)": "92%"
		},
		{
		  "LLM Model": "Mistral Large 2",
		  "Context Window": "128,000",
		  "Quality": 73,
		  "Speed": 41,
		  "Price (lower is better)": "$4.50 ",
		  "Reasoning & Knowledge (MMLU)": "85%",
		  "Scientific Reasoning & Knowledge (GPQA)": "48%",
		  "Quantitative Reasoning (MATH)": "72%",
		  "Coding (HumanEval)": "87%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1250",
		  "Maths (MGSM)": "87%"
		},
		{
		  "LLM Model": "Llama 3.1 Instruct 405B",
		  "Context Window": "128,000",
		  "Quality": 72,
		  "Speed": 29,
		  "Price (lower is better)": "$5.00 ",
		  "Reasoning & Knowledge (MMLU)": "87%",
		  "Scientific Reasoning & Knowledge (GPQA)": "50%",
		  "Quantitative Reasoning (MATH)": "69%",
		  "Coding (HumanEval)": "82%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1266",
		  "Maths (MGSM)": "83%"
		},
		{
		  "LLM Model": "Gemini 1.5 Pro",
		  "Context Window": "2,000,000",
		  "Quality": 72,
		  "Speed": 61,
		  "Price (lower is better)": "$5.30 ",
		  "Reasoning & Knowledge (MMLU)": "86%",
		  "Scientific Reasoning & Knowledge (GPQA)": "46%",
		  "Quantitative Reasoning (MATH)": "68%",
		  "Coding (HumanEval)": "84%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1301",
		  "Maths (MGSM)": "76%"
		},
		{
		  "LLM Model": "GPT-4o-mini",
		  "Context Window": "128,000",
		  "Quality": 71,
		  "Speed": 132,
		  "Price (lower is better)": "$0.30 ",
		  "Reasoning & Knowledge (MMLU)": "82%",
		  "Scientific Reasoning & Knowledge (GPQA)": "43%",
		  "Quantitative Reasoning (MATH)": "75%",
		  "Coding (HumanEval)": "86%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "-",
		  "Maths (MGSM)": "87%"
		},
		{
		  "LLM Model": "Llama 3.1 Instruct 70B",
		  "Context Window": "128,000",
		  "Quality": 65,
		  "Speed": 51,
		  "Price (lower is better)": "$0.90 ",
		  "Reasoning & Knowledge (MMLU)": "84%",
		  "Scientific Reasoning & Knowledge (GPQA)": "43%",
		  "Quantitative Reasoning (MATH)": "60%",
		  "Coding (HumanEval)": "75%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1248",
		  "Maths (MGSM)": "83%"
		},
		{
		  "LLM Model": "Gemini 1.5 Flash",
		  "Context Window": "1,000,000",
		  "Quality": 60,
		  "Speed": 207,
		  "Price (lower is better)": "$0.10 ",
		  "Reasoning & Knowledge (MMLU)": "79%",
		  "Scientific Reasoning & Knowledge (GPQA)": "39%",
		  "Quantitative Reasoning (MATH)": "55%",
		  "Coding (HumanEval)": "74%",
		  "Communication (LMSys Chatbot Arena ELO Score)": "1270",
		  "Maths (MGSM)": "76%"
		}
	]
}`;

// JSON parsed model dataset
const modelDataset = JSON.parse(modelDatasetPrompt);