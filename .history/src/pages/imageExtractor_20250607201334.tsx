import { useState } from 'react';
import axios from 'axios';

export default function ImageExtractor() {
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleExtract = async () => {
    try {
      const response = await axios.post('http://localhost:5000/extract-image', { url });
      setImageUrl(response.data.image_url);
      setError('');
    } catch (err) {
      setError('Error al extraer la imagen');
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Pega URL de Instagram"
        className="border p-2 w-full"
      />
      <button onClick={handleExtract} className="bg-blue-500 text-white px-4 py-2 mt-2">Extraer Imagen</button>
      {imageUrl && <img src={imageUrl} alt="Instagram" className="mt-4 max-w-full" />}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
