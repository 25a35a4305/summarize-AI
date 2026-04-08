import tkinter as tk
from tkinter import messagebox, scrolledtext
import threading

# Note: This application requires 'transformers' and 'torch' libraries.
# Run 'pip install transformers torch sentencepiece' before executing.

class SummarizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Text Summarizer")
        self.root.geometry("700x600")
        self.root.configure(bg="#f8f9fa")

        # Load model in a separate thread to keep UI responsive
        self.summarizer = None
        self.loading_thread = threading.Thread(target=self.load_model)
        self.loading_thread.start()

        self.setup_ui()

    def load_model(self):
        try:
            from transformers import pipeline
            # Using distilbart-cnn-6-6 which is even faster than 12-6
            self.summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-6-6")
            self.root.after(0, lambda: self.header.config(text="Summarize AI (Ready)"))
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")

    def setup_ui(self):
        # Header
        self.header = tk.Label(
            self.root, 
            text="Summarize AI (Loading Model...)", 
            font=("Helvetica", 18, "bold"),
            bg="#f8f9fa",
            fg="#333"
        )
        self.header.pack(pady=20)

        # Input Section
        tk.Label(self.root, text="Paste your text below:", font=("Helvetica", 10), bg="#f8f9fa").pack(anchor="w", padx=40)
        self.input_box = scrolledtext.ScrolledText(
            self.root, 
            height=12, 
            font=("Helvetica", 11),
            wrap=tk.WORD,
            bd=1,
            relief=tk.SOLID
        )
        self.input_box.pack(padx=40, pady=5, fill=tk.BOTH, expand=True)

        # Button
        self.summarize_btn = tk.Button(
            self.root, 
            text="Summarize", 
            command=self.handle_summarize,
            bg="#007bff",
            fg="white",
            font=("Helvetica", 11, "bold"),
            padx=20,
            pady=10,
            cursor="hand2",
            relief=tk.FLAT
        )
        self.summarize_btn.pack(pady=15)

        # Output Section
        tk.Label(self.root, text="Summary (3-5 sentences):", font=("Helvetica", 10), bg="#f8f9fa").pack(anchor="w", padx=40)
        self.output_box = scrolledtext.ScrolledText(
            self.root, 
            height=8, 
            font=("Helvetica", 11, "italic"),
            wrap=tk.WORD,
            bg="#e9ecef",
            state=tk.DISABLED,
            bd=1,
            relief=tk.SOLID
        )
        self.output_box.pack(padx=40, pady=5, fill=tk.BOTH, expand=True)

        # Footer
        tk.Label(
            self.root, 
            text="Powered by Hugging Face Transformers", 
            font=("Helvetica", 8),
            bg="#f8f9fa",
            fg="#6c757d"
        ).pack(pady=10)

    def handle_summarize(self):
        text = self.input_box.get("1.0", tk.END).strip()
        
        if not text:
            messagebox.showwarning("Empty Input", "Please enter some text to summarize.")
            return

        if not self.summarizer:
            messagebox.showinfo("Model Loading", "The AI model is still loading. Please wait a moment...")
            return

        # Disable button during processing
        self.summarize_btn.config(state=tk.DISABLED, text="Processing...")
        
        # Run summarization in a thread to avoid freezing UI
        threading.Thread(target=self.run_summarization, args=(text,)).start()

    def run_summarization(self, text):
        try:
            # Generate summary
            summary_list = self.summarizer(
                text, 
                max_length=150, 
                min_length=50, 
                do_sample=False
            )
            summary_text = summary_list[0]['summary_text']
            
            # Convert paragraph to bullet points by splitting sentences
            # This is a simple heuristic for BART which usually outputs paragraphs
            sentences = summary_text.split('. ')
            bullet_summary = "\n".join([f"• {s.strip().capitalize()}" for s in sentences if s.strip()])
            if not bullet_summary.endswith('.'):
                bullet_summary = bullet_summary.replace('\n', '.\n') + '.'
            
            # Update UI from thread
            self.root.after(0, lambda: self.display_summary(bullet_summary))
        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Error", f"Summarization failed: {str(e)}"))
            self.root.after(0, lambda: self.summarize_btn.config(state=tk.NORMAL, text="Summarize"))

    def display_summary(self, summary):
        self.output_box.config(state=tk.NORMAL)
        self.output_box.delete("1.0", tk.END)
        self.output_box.insert(tk.END, summary)
        self.output_box.config(state=tk.DISABLED)
        self.summarize_btn.config(state=tk.NORMAL, text="Summarize")

if __name__ == "__main__":
    root = tk.Tk()
    app = SummarizerApp(root)
    root.mainloop()
