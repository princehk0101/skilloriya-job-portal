import os
import json
import urllib.request
import urllib.error


def call_llm(prompt: str, system_instruction: str = "", json_mode: bool = False) -> str:
    """
    Unified LLM caller supporting both Groq (LLaMA 3) and Google Gemini (1.5 Flash).
    Falls back gracefully if keys fail or rate-limit.
    """
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # 1. Try Groq (Ultra-fast & free tier with LLaMA 3.1)
    if groq_key and not groq_key.startswith("gsk_YOUR_"):
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1500,
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}

            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {groq_key}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as res:
                body = json.loads(res.read().decode("utf-8"))
                return body["choices"][0]["message"]["content"]
        except Exception as e:
            print("Groq API call error:", e)

    # 2. Try Google Gemini (1.5 Flash free tier)
    if gemini_key and len(gemini_key) > 10:
        for model in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                req_body = {
                    "contents": [{"parts": [{"text": full_prompt}]}],
                }
                if json_mode:
                    req_body["generationConfig"] = {"response_mime_type": "application/json"}

                data = json.dumps(req_body).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={"Content-Type": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=12) as res:
                    body = json.loads(res.read().decode("utf-8"))
                    text = body["candidates"][0]["content"]["parts"][0]["text"]
                    return text
            except Exception as e:
                print(f"Gemini API ({model}) error:", e)

    return ""
