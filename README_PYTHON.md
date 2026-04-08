# AI Text Summarizer (Python)

This is a desktop application built with Python and Tkinter that uses Hugging Face Transformers to summarize long texts.

## Prerequisites

- Python 3.8+
- `pip` (Python package manager)

## Installation

1. Install the required libraries:
   ```bash
   pip install -r requirements.txt
   ```

## Running the App

1. Execute the Python script:
   ```bash
   python summarizer.py
   ```

## How it Works

- **Model:** Uses `sshleifer/distilbart-cnn-12-6` (a compact BART model) for high-quality summarization.
- **Interface:** Built with standard `Tkinter` for a native desktop feel.
- **Threading:** The AI model loads and processes in a background thread to keep the UI responsive.
- **Constraints:** Configured to produce concise summaries (3–5 sentences).
