import { useState } from 'react';
import axios from 'axios';

export default function StoryGenerator() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState('llama3-8b-8192');
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [characterImageUrl, setCharacterImageUrl] = useState('');
  const [characterLoading, setCharacterLoading] = useState(false);

  const extractCharacterPrompt = (storyText) => {
    const match = storyText.match(/(?:named\s)?([A-Z][a-z]+\s[A-Z][a-z]+|[A-Z][a-z]+)/);
    return match ? `A character illustration of ${match[1]}` : "Fantasy character portrait";
  };

  const generateImage = async (storyText) => {
    setImageLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/image", {
        prompt: `illustration of: ${storyText.slice(0, 300)}`
      });
      setImageUrl(res.data.image || res.data.imageUrl);
    } catch (err) {
      setError("Failed to generate story image");
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const generateCharacterImage = async (storyText) => {
    setCharacterLoading(true);
    const characterPrompt = extractCharacterPrompt(storyText);
    try {
      const res = await axios.post("http://localhost:5000/api/image", {
        prompt: characterPrompt
      });
      setCharacterImageUrl(res.data.image || res.data.imageUrl);
    } catch (err) {
      setError("Failed to generate character image");
      console.error(err);
    } finally {
      setCharacterLoading(false);
    }
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story prompt");
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setImageUrl('');
    setCharacterImageUrl('');
    setCopied(false);

    try {
      const response = await axios.post("http://localhost:5000/api/ai", { prompt, model });
      if (response.data?.response) {
        const storyText = response.data.response;
        setStory(storyText);
        generateImage(storyText);
        generateCharacterImage(storyText);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      setError("Failed to generate story");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy story");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#0f172a] text-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">✨ AI Story Generator (Llama 3)</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">AI Model:</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-2 bg-[#1e293b] border border-gray-600 text-white rounded-lg"
          disabled={loading}
        >
          <option value="llama3-8b-8192">Llama 3 8B (Fast)</option>
          <option value="llama3-70b-8192">Llama 3 70B (Powerful)</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Story Prompt:</label>
        <textarea
          id="prompt"
          className="w-full px-4 py-3 bg-[#1e293b] border border-gray-600 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: A story about a robot who learns to love..."
          disabled={loading}
        />
      </div>

      <button
        onClick={generateStory}
        disabled={loading || !prompt.trim()}
        className={`w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition text-white ${!prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Generating...' : 'Generate Story'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border-l-4 border-red-400 text-red-300 rounded-md">
          {error}
        </div>
      )}

      {story && (
        <div className="mt-8 bg-[#1e293b] p-5 rounded-xl border border-gray-700 relative">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-300">Your Story:</h3>
            <span className="text-sm text-gray-400">Model: {model.replace('-', ' ')}</span>
          </div>
          <div className="whitespace-pre-wrap text-gray-200">{story}</div>
          <button
            onClick={copyToClipboard}
            className="absolute top-4 right-4 text-sm bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-300 rounded shadow"
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}

      {imageLoading && <p className="mt-6 text-center text-sm text-gray-400">🎨 Generating story image...</p>}
      {imageUrl && (
        <div className="mt-6">
          <h4 className="text-center text-md font-semibold text-blue-300 mb-2">🌄 Story Illustration</h4>
          <img src={imageUrl} alt="Story Illustration" className="mx-auto rounded-xl shadow-lg" />
        </div>
      )}

      {characterLoading && <p className="mt-6 text-center text-sm text-gray-400">🧑‍🎨 Generating character image...</p>}
      {characterImageUrl && (
        <div className="mt-6">
          <h4 className="text-center text-md font-semibold text-blue-300 mb-2">🎭 Character Illustration</h4>
          <img src={characterImageUrl} alt="Character" className="mx-auto rounded-xl shadow-md" />
        </div>
      )}
    </div>
  );
}
