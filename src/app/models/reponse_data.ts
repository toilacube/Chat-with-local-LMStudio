// Example data:
/**{
        "id":"chatcmpl-6oxly7cb0bqwvslpmfepmk"
        "object":"chat.completion.chunk",
        "created":1724310345,
        "model":"lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf",
        "choices":[{"index":0,
                    "delta":{"role":"assistant","content":" I"},
                    "finish_reason":null}]
        }
     *  */
export interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
}

export interface Choice {
  index: number;
  delta: Msg;
  finish_reason: string;
}

export interface Msg {
  role: string;
  content: string;
}
