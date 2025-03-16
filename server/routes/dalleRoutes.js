import express from 'express';
import * as dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

dotenv.config();
console.log('Hugging Face API Key:', process.env.HF_API_KEY ? 'Exists' : 'Not Set');

const router = express.Router();
const client = new HfInference(process.env.HF_API_KEY);

// GET route to check if the server is working
router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from Hugging Face Stability AI!' });
});

// POST route to generate an image from a prompt
router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imageBlob = await client.textToImage({
      model: 'stabilityai/stable-diffusion-2',
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
      provider: 'hf-inference',
    });

    // Convert the Blob to a Buffer
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the Buffer to base64
    const base64Image = buffer.toString('base64');

    res.status(200).json({ photo: `data:image/jpeg;base64,${base64Image}` });
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.message || 'Something went wrong');
  }
});

export default router;